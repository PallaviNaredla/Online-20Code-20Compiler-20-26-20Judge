import Layout from "@/components/Layout";
import { useEffect, useState } from "react";
import { apiListSubmissions } from "@/lib/api";
import type { SubmissionRecord } from "@shared/api";

export default function Submissions() {
  const [items, setItems] = useState<SubmissionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    apiListSubmissions()
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Recent Submissions</h1>
      {loading && <p className="text-muted-foreground">Loading...</p>}
      {!loading && items.length === 0 && (
        <p className="text-muted-foreground">No submissions yet.</p>
      )}
      <div className="grid gap-3">
        {items.map((s) => (
          <div key={s.id} className="border rounded-lg p-4 bg-card">
            <div className="flex items-center justify-between">
              <div className="font-medium">{s.language.toUpperCase()}</div>
              <div className="text-sm text-muted-foreground">
                {new Date(s.createdAt).toLocaleString()}
              </div>
            </div>
            {s.runSummary && (
              <div className="mt-2 text-sm text-muted-foreground">
                Summary: {s.runSummary.passed}/{s.runSummary.total} passed ·{" "}
                {s.runSummary.durationMs}ms
              </div>
            )}
            <pre className="mt-3 bg-muted p-2 rounded text-xs overflow-auto max-h-48">
              {s.code}
            </pre>
          </div>
        ))}
      </div>
    </Layout>
  );
}
