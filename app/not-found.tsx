import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 — Not Found",
  description: "Page not found.",
};

export default function NotFound() {
  return (
    <article>
      <h1>404 — page not found</h1>
      <p style={{ color: "var(--muted)", fontFamily: "var(--font-roboto-mono, monospace)", fontSize: "0.95rem", marginBottom: "2rem" }}>
        The page you&apos;re looking for doesn&apos;t exist. Maybe it was deleted, moved, or never existed.
      </p>
      <Link href="/">← back home</Link>
    </article>
  );
}
