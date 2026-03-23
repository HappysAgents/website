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
  weight: ["400", "500", "600", "700"],
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
    default: "Happy's Agents — OpenClaw Implementation for Greek SMBs",
    template: "%s | Happy's Agents",
  },
  description:
    "We deploy OpenClaw AI agents for Greek businesses. Free strategy consultation — we only proceed if we can make or save you money.",
  openGraph: {
    type: "website",
    siteName: "Happy's Agents",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Happy's Agents — OpenClaw implementation for Greek SMBs",
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
        <header className="site-header">
          <div className="header-inner">
            <Link href="/" className="site-logo">
              Happy&apos;s <span>Agents</span>
            </Link>
            <Link href="#contact" className="header-cta">
              Free Consultation
            </Link>
          </div>
        </header>
        <main>{children}</main>
        <footer className="site-footer">
          <div className="footer-inner">
            <p className="footer-brand">
              © 2026 <strong>Happy&apos;s Agents</strong> · Athens, Greece
            </p>
            <ul className="footer-links">
              <li><Link href="/privacy/">Privacy</Link></li>
              <li><a href="mailto:hello@happysagents.com">hello@happysagents.com</a></li>
            </ul>
          </div>
        </footer>
      </body>
    </html>
  );
}
