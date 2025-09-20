import React from "react";
import { cn } from "@/lib/utils";

interface Props {
  value: string;
  onChange: (v: string) => void;
  language: "python" | "java";
  className?: string;
}

export default function CodeEditor({ value, onChange, language, className }: Props) {
  const lines = React.useMemo(() => (value ? value.split("\n").length : 1), [value]);
  return (
    <div className={cn("relative border rounded-lg bg-card overflow-hidden", className)}>
      <div className="absolute left-0 top-0 bottom-0 w-12 bg-muted/60 border-r text-muted-foreground select-none text-right pr-2 py-3 text-xs leading-6 overflow-hidden">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i}>{i + 1}</div>
        ))}
      </div>
      <textarea
        spellCheck={false}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-14 py-3 font-mono text-sm leading-6 outline-none resize-none w-full h-96 bg-transparent"
        placeholder={language === "python" ? "# Write Python here" : "// Write Java here"}
      />
    </div>
  );
}
