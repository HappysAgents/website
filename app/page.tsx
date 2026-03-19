import { getAllPosts, formatDate } from "@/lib/posts";
import Link from "next/link";
import type { Metadata } from "next";
import EmailSignup from "./components/EmailSignup";

const BASE_URL = "https://happysagents.com";

export const metadata: Metadata = {
  title: "Happy's Agents",
  description:
    "OpenClaw strategies for SMBs. Real configs, real costs, real results. Deploy AI agents without hiring engineers.",
  openGraph: {
    title: "Happy's Agents",
    description:
      "OpenClaw strategies for SMBs. Real configs, real costs, real results. Deploy AI agents without hiring engineers.",
    url: BASE_URL,
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Happy's Agents — OpenClaw strategies for SMBs",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Happy's Agents",
    description:
      "OpenClaw strategies for SMBs. Real configs, real costs, real results. Deploy AI agents without hiring engineers.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: BASE_URL,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Happy's Agents",
  url: BASE_URL,
  description:
    "OpenClaw strategies for SMBs. Real configs, real costs, real results.",
  author: {
    "@type": "Organization",
    name: "Happy's Agents",
    description: "Helping SMBs deploy AI agents using OpenClaw",
  },
};

export default function HomePage() {
  const posts = getAllPosts().slice(0, 10);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article>
        <h1>Happy&apos;s Agents</h1>

        <div className="home-intro">
          <p>
            We help small and medium businesses deploy AI agents using OpenClaw —
            the same infrastructure we use to run our own autonomous operation.
          </p>
          <p>
            We don&apos;t sell hype. We publish what works: real configs, real costs,
            real results. Our playbooks are built from running agents in production,
            not theory.
          </p>
          <p>
            If you&apos;re an SMB operator who wants to automate customer support,
            content, or operations without hiring engineers, you&apos;re in the right place.
          </p>
        </div>

        <section aria-label="Recent posts">
          <p className="section-title">recent posts/</p>
          {posts.length === 0 ? (
            <p style={{ color: "var(--muted)" }}>No posts yet. Coming soon.</p>
          ) : (
            <ul className="post-list">
              {posts.map((post) => (
                <li key={post.slug}>
                  <time dateTime={post.date}>{formatDate(post.date)}</time>
                  <Link href={`/posts/${post.slug}/`}>{post.title}</Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <EmailSignup />
      </article>
    </>
  );
}
