import { randomBytes } from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promises as fs } from "node:fs";
import { spawn } from "node:child_process";
import type { ExecuteRequest, ExecutionResult, Language } from "@shared/api";

function makeTmpDir() {
  const dir = join(
    tmpdir(),
    `judge-${Date.now()}-${randomBytes(6).toString("hex")}`,
  );
  return fs.mkdir(dir, { recursive: true }).then(() => dir);
}

function runProcess(
  cmd: string,
  args: string[],
  options: { cwd?: string; input?: string; timeoutMs: number },
): Promise<ExecutionResult> {
  return new Promise((resolve) => {
    const start = Date.now();
    const child = spawn(cmd, args, {
      cwd: options.cwd,
      stdio: ["pipe", "pipe", "pipe"],
      env: { ...process.env },
    });

    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (d) => (stdout += String(d)));
    child.stderr.on("data", (d) => (stderr += String(d)));

    const timer = setTimeout(() => {
      try {
        child.kill("SIGKILL");
      } catch {}
      const durationMs = Date.now() - start;
      resolve({
        stdout,
        stderr: stderr + "\n[Timed out]",
        exitCode: null,
        timedOut: true,
        durationMs,
      });
    }, options.timeoutMs);

    child.on("close", (code) => {
      clearTimeout(timer);
      const durationMs = Date.now() - start;
      resolve({ stdout, stderr, exitCode: code, timedOut: false, durationMs });
    });

    if (options.input) {
      child.stdin.write(options.input);
    }
    child.stdin.end();
  });
}

async function runPython(
  code: string,
  stdin: string | undefined,
  timeoutMs: number,
): Promise<ExecutionResult> {
  const dir = await makeTmpDir();
  const file = join(dir, "main.py");
  await fs.writeFile(file, code, "utf8");
  // Prefer python3, fallback to python
  const result = await runProcess(
    "bash",
    [
      "-lc",
      `command -v python3 >/dev/null 2>&1 && python3 ${file} || python ${file}`,
    ],
    {
      cwd: dir,
      input: stdin,
      timeoutMs,
    },
  );
  return result;
}

async function runJava(
  code: string,
  stdin: string | undefined,
  timeoutMs: number,
): Promise<ExecutionResult> {
  const dir = await makeTmpDir();
  const mainFile = join(dir, "Main.java");

  const ensured = ensureJavaMain(code);
  await fs.writeFile(mainFile, ensured, "utf8");

  const compile = await runProcess("bash", ["-lc", `javac Main.java`], {
    cwd: dir,
    timeoutMs: Math.max(2000, Math.floor(timeoutMs / 2)),
  });
  if (compile.exitCode !== 0) {
    return {
      ...compile,
      timedOut: compile.timedOut,
      exitCode: compile.exitCode,
      stdout: compile.stdout,
      stderr: "Compilation failed\n" + compile.stderr,
      durationMs: compile.durationMs,
    };
  }
  const run = await runProcess("bash", ["-lc", `java Main`], {
    cwd: dir,
    input: stdin,
    timeoutMs,
  });
  return run;
}

function ensureJavaMain(code: string): string {
  const hasMainClass = /class\s+Main\b/.test(code);
  if (hasMainClass) return code;
  // Wrap user code inside a Main class if not present.
  return `import java.io.*;\nimport java.util.*;\npublic class Main {\n    public static void main(String[] args) throws Exception {\n        new Main().solve();\n    }\n    void solve() throws Exception {\n${indent(code, 8)}\n    }\n}`;
}

function indent(text: string, spaces: number) {
  const pad = " ".repeat(spaces);
  return text
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((l) => (l.length ? pad + l : l))
    .join("\n");
}

export async function execute(req: ExecuteRequest): Promise<ExecutionResult> {
  const timeout = req.timeoutMs ?? 4000;
  const lang: Language = req.language;
  if (lang === "python") return runPython(req.code, req.stdin, timeout);
  if (lang === "java") return runJava(req.code, req.stdin, timeout);
  throw new Error("Unsupported language");
}
