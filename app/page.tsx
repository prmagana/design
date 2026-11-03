import { Nav } from "./nav";

// One line for now. The system grows under it: tokens, type, the pills and cards the sites already share.
export default function Home() {
  return (
    <>
      <Nav />
      <main className="flex flex-1 flex-col items-center justify-center px-6 pb-24 text-center">
        <h1 className="max-w-2xl text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
          The start of a cohesive design system for tapt.
        </h1>
      </main>
    </>
  );
}
