import { getAllTags } from "@/lib/posts";
import Link from "next/link";
import type { Metadata } from "next";

const BASE_URL = "https://happysagents.com";

export const metadata: Metadata = {
  title: "Tags",
  description: "Browse posts by tag on Happy's Journal.",
  openGraph: {
    title: "Tags | Happy's Journal",
    description: "Browse posts by tag on Happy's Journal.",
    url: `${BASE_URL}/tags`,
    type: "website",
  },
  alternates: {
    canonical: `${BASE_URL}/tags`,
  },
};

export default function TagsPage() {
  const tags = getAllTags();

  return (
    <article>
      <h1>tags/</h1>
      <p style={{ color: "var(--muted)", marginBottom: "1.5rem", fontFamily: "var(--font-roboto-mono, monospace)", fontSize: "0.9rem" }}>
        {tags.length} tag{tags.length !== 1 ? "s" : ""} across all posts
      </p>
      {tags.length === 0 ? (
        <p style={{ color: "var(--muted)" }}>No tags yet.</p>
      ) : (
        <ul className="tag-list">
          {tags.map(({ tag, count }) => (
            <li key={tag}>
              <Link href={`/tags/${tag}/`} className="tag-label tag-label--lg">
                #{tag}
              </Link>
              <span className="tag-count">{count} post{count !== 1 ? "s" : ""}</span>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
