/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

export type Language = "python" | "java";

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
}

export interface ExecuteRequest {
  language: Language;
  code: string;
  stdin?: string;
  timeoutMs?: number;
}

export interface TestRunRequest {
  language: Language;
  code: string;
  tests: TestCase[];
  timeoutMs?: number;
}

export interface ExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number | null;
  timedOut: boolean;
  durationMs: number;
}

export interface ExecuteResponse extends ExecutionResult {}

export interface TestRunCaseResult extends ExecutionResult {
  testId: string;
  expectedOutput: string;
  passed: boolean;
}

export interface TestRunResponse {
  total: number;
  passed: number;
  results: TestRunCaseResult[];
}

export interface SubmissionRecord {
  id: string;
  createdAt: string; // ISO
  language: Language;
  code: string;
  tests?: TestCase[];
  runSummary: {
    total: number;
    passed: number;
    durationMs: number;
  } | null;
  lastRun: ExecutionResult | null;
}
