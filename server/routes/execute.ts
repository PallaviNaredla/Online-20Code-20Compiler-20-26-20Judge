import type { RequestHandler } from "express";
import { execute as runExec } from "../judge/executor";
import type {
  ExecuteRequest,
  TestRunRequest,
  TestRunResponse,
  TestRunCaseResult,
} from "@shared/api";

export const handleExecute: RequestHandler = async (req, res) => {
  const body = req.body as ExecuteRequest;
  if (!body || !body.code || !body.language) {
    return res.status(400).json({ error: "Invalid payload" });
  }
  try {
    const result = await runExec({
      language: body.language,
      code: body.code,
      stdin: body.stdin ?? "",
      timeoutMs: body.timeoutMs ?? 4000,
    });
    return res.json(result);
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || "Execution failed" });
  }
};

export const handleTestRun: RequestHandler = async (req, res) => {
  const body = req.body as TestRunRequest;
  if (!body || !body.code || !body.language || !Array.isArray(body.tests)) {
    return res.status(400).json({ error: "Invalid payload" });
  }
  try {
    const timeoutMs = body.timeoutMs ?? 4000;
    const results: TestRunCaseResult[] = [];
    let passed = 0;
    for (const t of body.tests) {
      const r = await runExec({
        language: body.language,
        code: body.code,
        stdin: t.input,
        timeoutMs,
      });
      const expected = (t.expectedOutput ?? "").trim();
      const got = (r.stdout ?? "").trim();
      const ok = expected.length
        ? got === expected
        : r.exitCode === 0 && !r.timedOut;
      results.push({
        ...r,
        testId: t.id,
        expectedOutput: t.expectedOutput,
        passed: ok,
      });
      if (ok) passed++;
    }
    const resp: TestRunResponse = { total: body.tests.length, passed, results };
    return res.json(resp);
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || "Test run failed" });
  }
};
