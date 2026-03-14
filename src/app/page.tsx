import { AboutSheet } from "@/components/library/about-sheet";
import { LibrarySearch } from "@/components/library/library-search";
import { ThemeToggle } from "@/components/library/theme-toggle";
import { PageTransition } from "@/components/layout/page-transition";
import { Button } from "@/components/ui/button";
import { ALGORITHMS } from "@/data/algorithms";
import { isAlgorithmImplemented } from "@/algorithms/registry";
import Link from "next/link";

export default function LibraryPage() {
  const algorithms = ALGORITHMS.map((algorithm) => ({
    ...algorithm,
    implemented: isAlgorithmImplemented(algorithm.slug),
  }));

  return (
    <PageTransition className="relative min-h-svh overflow-hidden bg-background">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-[-15rem] mx-auto h-[28rem] w-[28rem] rounded-full bg-gradient-to-br from-zinc-500/14 via-zinc-500/6 to-transparent blur-3xl"
      />
      <div className="container-page relative z-10 flex min-h-svh flex-col py-6 md:py-8">
        <header className="flex items-center justify-end gap-1">
          <Button asChild variant="ghost" size="sm">
            <Link href="/compare">Compare</Link>
          </Button>
          <AboutSheet />
          <ThemeToggle />
        </header>
        <main className="flex flex-1 items-center justify-center pb-16 pt-8 md:pb-24">
          <div className="w-full max-w-4xl">
            <LibrarySearch algorithms={algorithms} />
          </div>
        </main>
      </div>
    </PageTransition>
  );
}
