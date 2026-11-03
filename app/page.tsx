import { Nav } from "./nav";

// The catalog grows under this headline, so it sits at the top like a page title, not centred in the viewport.
export default function Home() {
  return (
    <>
      <Nav />
      {/* Same column as the nav (max-w-6xl) so the title and the grid below share a left edge. */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-16 pb-24 sm:px-6 sm:pt-24">
        {/* Everything softened except the brand word, so "tapt" is the one thing at full ink. */}
        <h1 className="max-w-2xl text-3xl font-semibold leading-tight tracking-tight text-foreground/70 sm:text-5xl">
          The start of a cohesive design system for <span className="text-foreground">tapt</span>.
        </h1>
      </main>
    </>
  );
}
