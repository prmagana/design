import { Cell, Section, grid } from "./section";
import type { System } from "./system";

type TokenRepo = System["colors"]["tokens"][number]["repos"][number];

// Inline style on purpose: the value comes from the scan, so no Tailwind class could exist for it.
function Swatch({ value }: { value: string | null }) {
  if (!value) return <span className="block h-8 w-full rounded border border-dashed border-edge" />;
  return <span className="block h-8 w-full rounded border border-edge" style={{ background: value }} />;
}

// Repos that define a token identically collapse to one row, so a row of its own means drift.
function groupByValue(repos: TokenRepo[]) {
  const groups = new Map<string, { light: string; dark: string | null; repos: string[]; count: number }>();
  for (const r of repos) {
    const key = `${r.light}|${r.dark}`;
    const g = groups.get(key) ?? { light: r.light, dark: r.dark, repos: [], count: 0 };
    g.repos.push(r.repo);
    g.count += r.count;
    groups.set(key, g);
  }
  return [...groups.values()];
}

export function Colors({ data }: { data: System["colors"] }) {
  return (
    <>
      <Section title="Tokens" count={data.tokens.length}>
        <ul className="font-mono text-xs">
          {data.tokens.map(({ name, repos }) => (
            <li key={name} className="grid grid-cols-[6rem_1fr] gap-4 border-b border-edge py-3">
              <span className="pt-2">{name}</span>
              <ul className="space-y-2">
                {groupByValue(repos).map((g) => (
                  <li key={g.light + g.dark} className="grid grid-cols-[1fr_1fr_3rem] items-center gap-3 sm:grid-cols-[10rem_1fr_1fr_3rem]">
                    <span className="col-span-3 truncate text-muted sm:col-span-1">{g.repos.join(" ")}</span>
                    <Swatch value={g.light} />
                    <Swatch value={g.dark} />
                    <span className="text-right text-muted tabular-nums">{g.count}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Palette" count={data.palette.length}>
        <ul className={grid}>
          {data.palette.map(({ class: cls, value, uses }) => (
            <Cell key={cls} label={cls} repos={uses.map((u) => u.repo)} preview={<Swatch value={value} />} />
          ))}
        </ul>
      </Section>

      <Section title="Literals" count={data.literals.length}>
        <ul className={grid}>
          {data.literals.map(({ value, uses }) => (
            <Cell key={value} label={value} repos={uses.map((u) => u.repo)} preview={<Swatch value={value} />} />
          ))}
        </ul>
      </Section>
    </>
  );
}
