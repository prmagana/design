import TaptMark from "./tapt-mark";

// Root's bar with the sign-in dropped. Nothing on the right, so the mark sits dead centre instead of left.
export function Nav() {
  return (
    <nav className="sticky top-0 z-50 w-full shrink-0 bg-background px-4 sm:px-6">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-center">
        <TaptMark className="size-9 select-none text-ink" />
      </div>
    </nav>
  );
}
