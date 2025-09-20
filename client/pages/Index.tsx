import { useMemo, useState } from "react";
import Layout from "@/components/Layout";
import CodeEditor from "@/components/code/CodeEditor";
import TestCasesEditor from "@/components/code/TestCasesEditor";
import ResultPanel from "@/components/code/ResultPanel";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiCreateSubmission, apiExecute, apiTestRun } from "@/lib/api";
import type {
  ExecutionResult,
  Language,
  SubmissionRecord,
  TestCase,
  TestRunResponse,
} from "@shared/api";

const templates: Record<Language, string> = {
  python: `# AlgoJudge Python Template\n# Read from stdin and print to stdout\n# Example: sum two numbers\na, b = map(int, input().split())\nprint(a + b)`,
  java: `// AlgoJudge Java Template\n// Ensure your main class is Main\nimport java.util.*;\npublic class Main {\n  public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    int a = sc.nextInt();\n    int b = sc.nextInt();\n    System.out.println(a + b);\n  }\n}`,
};

export default function Index() {
  const [language, setLanguage] = useState<Language>("python");
  const [code, setCode] = useState<string>(templates["python"]);
  const [stdin, setStdin] = useState<string>("2 3");
  const [tests, setTests] = useState<TestCase[]>([]);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [testResults, setTestResults] = useState<TestRunResponse | null>(null);

  const onLanguageChange = (l: Language) => {
    setLanguage(l);
    setCode(templates[l]);
    setResult(null);
    setTestResults(null);
  };

  const run = async () => {
    setBusy(true);
    setTestResults(null);
    try {
      const r = await apiExecute({ language, code, stdin });
      setResult(r);
    } finally {
      setBusy(false);
    }
  };

  const runTests = async () => {
    setBusy(true);
    setResult(null);
    try {
      const r = await apiTestRun({ language, code, tests });
      setTestResults(r);
    } finally {
      setBusy(false);
    }
  };

  const submit = async () => {
    const now = new Date().toISOString();
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const rec: SubmissionRecord = {
      id,
      createdAt: now,
      language,
      code,
      tests: tests.length ? tests : undefined,
      runSummary: testResults
        ? {
            total: testResults.total,
            passed: testResults.passed,
            durationMs: testResults.results.reduce(
              (a, b) => a + b.durationMs,
              0,
            ),
          }
        : result
          ? {
              total: 1,
              passed: result.exitCode === 0 && !result.timedOut ? 1 : 0,
              durationMs: result.durationMs,
            }
          : null,
      lastRun: result || null,
    };
    await apiCreateSubmission(rec);
    alert("Submission saved");
  };

  return (
    <Layout>
      <section className="mb-6">
        <div className="rounded-xl border bg-gradient-to-br from-fuchsia-500/10 via-sky-500/10 to-emerald-500/10 p-6">
          <h1 className="text-3xl font-extrabold tracking-tight">
            Online Code Compiler & Judge
          </h1>
          <p className="text-muted-foreground mt-2 max-w-3xl">
            Compile and run Java or Python code against custom input or test
            cases. Designed to showcase DSA, backend design, scalability, and
            testing.
          </p>
        </div>
      </section>

      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <Select
              value={language}
              onValueChange={(v) => onLanguageChange(v as Language)}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="java">Java</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="secondary"
              onClick={() => setCode(templates[language])}
            >
              Reset Template
            </Button>
          </div>
          <CodeEditor value={code} onChange={setCode} language={language} />
          <div className="mt-3 flex flex-wrap gap-3">
            <Button onClick={run} disabled={busy}>
              Run
            </Button>
            <Button
              onClick={runTests}
              variant="outline"
              disabled={busy || tests.length === 0}
            >
              Run Tests
            </Button>
            <Button onClick={submit} variant="secondary" disabled={busy}>
              Submit
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Note: For Java, ensure your main class is Main. Execution is
            sandboxed with timeouts but not fully isolated; avoid untrusted
            code.
          </p>
        </div>
        <div>
          <Tabs defaultValue="input">
            <TabsList>
              <TabsTrigger value="input">Custom Input</TabsTrigger>
              <TabsTrigger value="tests">Test Cases</TabsTrigger>
              <TabsTrigger value="output">Output</TabsTrigger>
            </TabsList>
            <TabsContent value="input" className="mt-3">
              <Textarea
                value={stdin}
                onChange={(e) => setStdin(e.target.value)}
                rows={8}
                className="font-mono"
              />
            </TabsContent>
            <TabsContent value="tests" className="mt-3">
              <TestCasesEditor tests={tests} onChange={setTests} />
            </TabsContent>
            <TabsContent value="output" className="mt-3">
              <ResultPanel result={result} tests={testResults} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}
