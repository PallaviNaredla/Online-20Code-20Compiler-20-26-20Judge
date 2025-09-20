import type { ExecutionResult, TestRunResponse } from "@shared/api";

export default function ResultPanel({
  result,
  tests,
}: {
  result?: ExecutionResult | null;
  tests?: TestRunResponse | null;
}) {
  return (
    <div className="border rounded-lg p-3 bg-card">
      {!result && !tests && (
        <p className="text-sm text-muted-foreground">
          No output yet. Run your code to see results.
        </p>
      )}
      {result && (
        <div>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <Badge
              label={`Exit: ${result.exitCode ?? "-"}`}
              kind={
                result.exitCode === 0 && !result.timedOut
                  ? "ok"
                  : result.timedOut
                    ? "warn"
                    : "err"
              }
            />
            <Badge label={`Time: ${result.durationMs}ms`} />
          </div>
          <div className="mt-3">
            <h4 className="font-semibold mb-1">Stdout</h4>
            <pre className="bg-muted p-2 rounded-md text-sm overflow-auto max-h-64 whitespace-pre-wrap">
              {result.stdout || ""}
            </pre>
          </div>
          {result.stderr && (
            <div className="mt-3">
              <h4 className="font-semibold mb-1">Stderr</h4>
              <pre className="bg-muted p-2 rounded-md text-sm overflow-auto max-h-64 whitespace-pre-wrap text-red-600 dark:text-red-400">
                {result.stderr}
              </pre>
            </div>
          )}
        </div>
      )}
      {tests && (
        <div>
          <div className="flex items-center gap-4 text-sm">
            <Badge
              label={`Passed ${tests.passed}/${tests.total}`}
              kind={
                tests.passed === tests.total
                  ? "ok"
                  : tests.passed === 0
                    ? "err"
                    : "warn"
              }
            />
          </div>
          <div className="mt-3 space-y-3 max-h-80 overflow-auto pr-2">
            {tests.results.map((r, i) => (
              <div key={r.testId} className="border rounded-md p-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="font-medium">Case #{i + 1}</div>
                  <Badge
                    label={r.passed ? "Passed" : "Failed"}
                    kind={r.passed ? "ok" : "err"}
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-2 mt-2 text-sm">
                  <div>
                    <div className="text-muted-foreground">Stdout</div>
                    <pre className="bg-muted p-2 rounded whitespace-pre-wrap max-h-32 overflow-auto">
                      {r.stdout}
                    </pre>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Expected</div>
                    <pre className="bg-muted p-2 rounded whitespace-pre-wrap max-h-32 overflow-auto">
                      {r.expectedOutput}
                    </pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Badge({
  label,
  kind = "neutral",
}: {
  label: string;
  kind?: "ok" | "warn" | "err" | "neutral";
}) {
  const base = "px-2 py-1 rounded text-xs font-medium";
  const map = {
    ok: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20",
    warn: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/20",
    err: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/20",
    neutral: "bg-muted text-muted-foreground border border-border",
  } as const;
  return <span className={`${base} ${map[kind]}`}>{label}</span>;
}
