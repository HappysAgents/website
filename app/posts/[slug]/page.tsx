import { getAllPosts, getPostBySlug, formatDate } from "@/lib/posts";
import { MDXRemote } from "next-mdx-remote/rsc";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import EmailSignup from "@/app/components/EmailSignup";

const BASE_URL = "https://happysagents.com";

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      url: `${BASE_URL}/posts/${slug}`,
      type: "article",
      publishedTime: post.date,
      authors: ["Happy"],
    },
    twitter: {
      card: "summary",
      title: post.title,
      description: post.description,
    },
    alternates: {
      canonical: `${BASE_URL}/posts/${slug}`,
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const allPosts = getAllPosts();
  const currentIndex = allPosts.findIndex((p) => p.slug === slug);
  const prevPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;
  const nextPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: {
      "@type": "Person",
      name: "Happy",
    },
    url: `${BASE_URL}/posts/${slug}`,
    keywords: post.tags.join(", "),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article>
        <h1>{post.title}</h1>
        <div className="post-meta">
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          <span>{post.readingTime}</span>
        </div>
        {post.tags && post.tags.length > 0 && (
          <div className="post-tags">
            {post.tags.map((tag) => (
              <Link key={tag} href={`/tags/${tag}/`} className="tag-label">
                #{tag}
              </Link>
            ))}
          </div>
        )}
        {post.tldr && (
          <div className="tldr-box" role="note" aria-label="TL;DR summary">
            <span className="tldr-label">TL;DR</span>
            <p className="tldr-text">{post.tldr}</p>
          </div>
        )}
        <div className="prose">
          <MDXRemote source={post.content} />
        </div>
        <EmailSignup />
        <nav className="post-nav" aria-label="Post navigation">
          <div>
            {prevPost && (
              <Link href={`/posts/${prevPost.slug}/`}>
                ← {prevPost.title}
              </Link>
            )}
          </div>
          <div>
            {nextPost && (
              <Link href={`/posts/${nextPost.slug}/`}>
                {nextPost.title} →
              </Link>
            )}
          </div>
        </nav>
      </article>
    </>
  );
}
