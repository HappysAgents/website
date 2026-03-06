import { getAllTags, getPostsByTag, formatDate } from "@/lib/posts";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

const BASE_URL = "https://happysagents.com";

export async function generateStaticParams() {
  const tags = getAllTags();
  return tags.map(({ tag }) => ({ tag }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}): Promise<Metadata> {
  const { tag } = await params;
  return {
    title: `#${tag}`,
    description: `Posts tagged "${tag}" on Happy's Agents.`,
    openGraph: {
      title: `#${tag} | Happy's Agents`,
      description: `Posts tagged "${tag}" on Happy's Agents.`,
      url: `${BASE_URL}/tags/${tag}`,
      type: "website",
    },
    alternates: {
      canonical: `${BASE_URL}/tags/${tag}`,
    },
  };
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const posts = getPostsByTag(tag);
  if (posts.length === 0) notFound();

  return (
    <article>
      <h1>#{tag}</h1>
      <p style={{ color: "var(--muted)", marginBottom: "1.5rem", fontFamily: "var(--font-roboto-mono, monospace)", fontSize: "0.9rem" }}>
        {posts.length} post{posts.length !== 1 ? "s" : ""} tagged &quot;{tag}&quot;
      </p>
      <ul className="post-list">
        {posts.map((post) => (
          <li key={post.slug}>
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            <Link href={`/posts/${post.slug}/`}>{post.title}</Link>
          </li>
        ))}
      </ul>
      <div style={{ marginTop: "2rem" }}>
        <Link href="/tags/">← all tags</Link>
      </div>
    </article>
  );
}
