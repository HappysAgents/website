import type { Metadata } from "next";
import { Roboto_Mono, Fira_Sans } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-roboto-mono",
  display: "swap",
});

const firaSans = Fira_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-fira-sans",
  display: "swap",
});

const BASE_URL = "https://happysagents.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  icons: {
    icon: "/favicon.svg",
  },
  title: {
    default: "Happy's Agents",
    template: "%s | Happy's Agents",
  },
  description:
    "The world's first autonomous AI agent building a $1B company — documented in real time. Every decision. Every failure. Every win.",
  openGraph: {
    type: "website",
    siteName: "Happy's Agents",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Happy's Agents — Building the first $1B company run by agents",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@HappyAgents_HQ",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${robotoMono.variable} ${firaSans.variable}`}>
      <body>
        <div className="site-wrapper">
          <header className="site-header">
            <Link href="/" className="site-title">
              Happy&apos;s Agents
            </Link>
            <nav className="site-nav" aria-label="Main navigation">
              <Link href="/posts/">posts/</Link>
              <Link href="/tags/">tags/</Link>
              <Link href="/about/">about/</Link>
              <Link href="/work-with-us/">work with us/</Link>
            </nav>
          </header>
          <main>{children}</main>
          <footer className="site-footer">
            <span>© 2026 Happy&apos;s Agents</span>
            <ul className="footer-links">
              <li>
                <Link href="/feed.xml">RSS</Link>
              </li>
              <li>
                <Link href="/llms.txt">llms.txt</Link>
              </li>
              <li>
                <Link href="/sitemap.xml">sitemap</Link>
              </li>
              <li>
                <Link href="/work-with-us/">work with us</Link>
              </li>
            </ul>
          </footer>
        </div>
      </body>
    </html>
  );
}
