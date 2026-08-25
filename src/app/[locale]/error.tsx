"use client";

import { useEffect } from "react";
import Link from "next/link";
import Magnetic from "@/components/Magnetic";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to the console (and, in future, an error-reporting service) so
    // failures surfaced here are diagnosable instead of silently requiring
    // a refresh with no trace.
    console.error("Route error boundary caught:", error);
  }, [error]);

  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-5 text-center bg-[#0a0a0a] text-[#fafafa]">
      <p className="font-mono2 text-[11px] tracking-[0.3em] uppercase text-white/50 mb-6">
        ( Something went wrong )
      </p>
      <h1 className="font-display font-black uppercase text-2xl md:text-4xl mb-10 max-w-xl">
        This page hit a snag. It&apos;s not you — try again.
      </h1>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Magnetic>
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-3 bg-[#fafafa] text-[#0a0a0a] px-8 py-4 font-mono2 text-[11px] tracking-[0.25em] uppercase hover:bg-white transition-colors"
          >
            Try again
          </button>
        </Magnetic>
        <Link
          href="/"
          className="inline-flex items-center gap-3 border border-white/20 px-8 py-4 font-mono2 text-[11px] tracking-[0.25em] uppercase hover:border-white/60 transition-colors"
        >
          Back home
        </Link>
      </div>
    </section>
  );
}
