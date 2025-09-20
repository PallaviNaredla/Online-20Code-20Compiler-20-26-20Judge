import type { ExecuteRequest, ExecuteResponse, TestRunRequest, TestRunResponse, SubmissionRecord } from "@shared/api";

export async function apiExecute(body: ExecuteRequest): Promise<ExecuteResponse> {
  const res = await fetch("/api/execute", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function apiTestRun(body: TestRunRequest): Promise<TestRunResponse> {
  const res = await fetch("/api/test-run", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function apiCreateSubmission(body: SubmissionRecord): Promise<void> {
  const res = await fetch("/api/submissions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(await res.text());
}

export async function apiListSubmissions(limit = 20): Promise<SubmissionRecord[]> {
  const res = await fetch(`/api/submissions?limit=${limit}`);
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.items as SubmissionRecord[];
}
