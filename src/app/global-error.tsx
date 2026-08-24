"use client";

import { useEffect } from "react";

// Fallback error boundary for errors thrown by the root layout itself
// (outside the reach of app/error.tsx). Must render its own <html>/<body>
// since it replaces the entire root layout when triggered.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error boundary caught:", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          background: "#0a0a0a",
          color: "#fafafa",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          padding: "1.5rem",
        }}
      >
        <p style={{ fontSize: 12, letterSpacing: "0.3em", textTransform: "uppercase", opacity: 0.5, marginBottom: 24 }}>
          ( Something went wrong )
        </p>
        <h1 style={{ fontSize: 24, fontWeight: 800, textTransform: "uppercase", maxWidth: 480, marginBottom: 32 }}>
          The site hit a snag loading. Please try again.
        </h1>
        <button
          onClick={() => reset()}
          style={{
            background: "#fafafa",
            color: "#0a0a0a",
            padding: "1rem 2rem",
            fontSize: 11,
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            border: "none",
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
