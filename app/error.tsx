"use client";

// Route error boundary. AniList and Jikan are both flaky by design, so a failed
// fetch should offer a retry rather than a blank screen.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="shell section">
      <div className="empty">
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.6rem",
            marginBottom: 12,
            color: "var(--bone)",
          }}
        >
          That didn&apos;t load
        </h2>
        <p style={{ marginBottom: 22 }}>
          {error.message || "Could not reach the anime catalogue."}
        </p>
        <button className="btn btn-solid" onClick={reset}>
          Try again
        </button>
      </div>
    </main>
  );
}
