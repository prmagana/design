import { icons } from "lucide-react";
import { Cell, Section, grid } from "./section";
import type { System } from "./system";

// Every lucide name the tools import, drawn for real. Solid foreground: icons are never translucent.
export function Icons({ data }: { data: System["icons"] }) {
  return (
    <>
      <Section title="Icons" count={data.lucide.length}>
        <ul className={grid}>
          {data.lucide.map(({ name, uses }) => {
            const Icon = icons[name as keyof typeof icons];
            return (
              <Cell
                key={name}
                label={name}
                repos={uses.map((u) => u.repo)}
                preview={Icon ? <Icon size={20} className="text-foreground" /> : <span className="font-mono text-xs text-muted">?</span>}
              />
            );
          })}
        </ul>
      </Section>

      {/* SVGs written by hand live in the repos as files; listed by path until it is worth rendering them. */}
      <Section title="Hand-drawn" count={data.inline.length}>
        <ul className="font-mono text-xs">
          {data.inline.map(({ repo, file }) => (
            <li key={repo + file} className="flex gap-4 border-b border-edge py-2">
              <span className="w-16 shrink-0 text-muted">{repo}</span>
              <span className="truncate">{file}</span>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
