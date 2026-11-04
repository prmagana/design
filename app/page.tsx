import system from "../data/system.json";
import { Colors } from "./colors";
import { Icons } from "./icons";
import { Nav } from "./nav";
import type { System } from "./system";

const data = system as System;

// A status page, not a showcase: what the tapt repos use today, as of the commits in the scan line.
export default function Home() {
  return (
    <>
      <Nav />
      {/* Same column as the nav (max-w-6xl) so the title and the grids share a left edge. */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-16 pb-24 sm:px-6 sm:pt-24">
        {/* Everything softened except the brand word, so "tapt" is the one thing at full ink. */}
        <h1 className="max-w-2xl text-3xl font-semibold leading-tight tracking-tight text-foreground/70 sm:text-5xl">
          The start of a cohesive design system for <span className="text-foreground">tapt</span>.
        </h1>
        {/* What the page is, in two lines: an audit of the real thing, not a pitch for an ideal one. */}
        <p className="mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
          What the <span className="text-foreground">tapt</span> repos actually use: every icon, token and color, read
          from source on each build. It gets better as they do.
        </p>
        <p className="mt-5 flex items-center gap-2.5 font-mono text-xs text-muted">
          {/* The live dot: a solid core and a ring that pings out of it. Still for reduced-motion users. */}
          <span className="relative flex size-2">
            <span className="absolute inset-0 rounded-full bg-emerald-500 motion-safe:animate-ping" />
            <span className="relative size-2 rounded-full bg-emerald-500" />
          </span>
          <span>scanned {data.scannedAt.slice(0, 10)} · {data.repos.map((r) => `${r.name}@${r.sha}`).join(" · ")}</span>
        </p>
        <Icons data={data.icons} />
        <Colors data={data.colors} />
      </main>
    </>
  );
}
