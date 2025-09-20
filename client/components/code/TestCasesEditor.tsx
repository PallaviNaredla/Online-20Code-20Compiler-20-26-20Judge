import { useId } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { TestCase } from "@shared/api";

interface Props {
  tests: TestCase[];
  onChange: (tests: TestCase[]) => void;
}

export default function TestCasesEditor({ tests, onChange }: Props) {
  const add = () => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    onChange([...tests, { id, input: "", expectedOutput: "" }]);
  };
  const remove = (id: string) => onChange(tests.filter((t) => t.id !== id));
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">Test Cases</h4>
        <Button size="sm" onClick={add} variant="secondary">Add</Button>
      </div>
      {tests.length === 0 && (
        <p className="text-sm text-muted-foreground">No tests yet. Click Add to create one.</p>
      )}
      <div className="space-y-4">
        {tests.map((t, idx) => (
          <div key={t.id} className="border rounded-md p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Case #{idx + 1}</span>
              <Button variant="ghost" size="sm" onClick={() => remove(t.id)}>Remove</Button>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground">Input (stdin)</label>
                <Textarea value={t.input} onChange={(e) => onChange(tests.map((x) => x.id === t.id ? { ...x, input: e.target.value } : x))} rows={4} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Expected Output</label>
                <Textarea value={t.expectedOutput} onChange={(e) => onChange(tests.map((x) => x.id === t.id ? { ...x, expectedOutput: e.target.value } : x))} rows={4} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
