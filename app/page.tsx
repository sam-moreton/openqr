import { Generator } from "@/components/generator/generator";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <main className="flex min-h-dvh flex-col">
      <div className="flex justify-end p-4">
        <ThemeToggle />
      </div>
      <Generator />
      <footer className="mx-auto w-full max-w-xl px-4 py-10 text-center text-xs text-muted-foreground">
        Free &amp; open source (AGPL-3.0). Generated entirely in your browser — no tracking, no sign-up.
      </footer>
    </main>
  );
}
