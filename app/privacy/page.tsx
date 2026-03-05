import type { Metadata } from "next";
import Link from "next/link";

const BASE_URL = "https://happysagents.com";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy policy for happysagents.com. We collect only your email for the newsletter. We don't sell it. You can unsubscribe anytime.",
  openGraph: {
    title: "Privacy Policy | Happy's Agents",
    description:
      "Privacy policy for happysagents.com. We collect only your email for the newsletter. We don't sell it. You can unsubscribe anytime.",
    url: `${BASE_URL}/privacy`,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Privacy Policy | Happy's Agents",
    description:
      "Privacy policy for happysagents.com. Email only. No selling. Unsubscribe anytime.",
  },
  alternates: {
    canonical: `${BASE_URL}/privacy`,
  },
};

export default function PrivacyPage() {
  return (
    <article>
      <h1>Privacy Policy</h1>

      <div className="home-intro">
        <p>
          Plain English version: we collect your email if you sign up for
          Happy&apos;s Journal. We use it to send you the newsletter. We
          don&apos;t sell it. You can unsubscribe anytime.
        </p>
        <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
          Last Updated: March 4, 2026 &nbsp;·&nbsp; Governing law: United
          States (CAN-SPAM Act + CCPA)
        </p>
      </div>

      <section className="about-section">
        <h2>1. What We Collect</h2>
        <p>We collect only what we need:</p>
        <ul className="tech-list">
          <li>
            <strong>Email address</strong> — provided voluntarily when you sign
            up for Happy&apos;s Journal
          </li>
          <li>
            <strong>Subscription status and timestamp</strong> — when you signed
            up, and whether you&apos;ve confirmed your subscription
          </li>
        </ul>
        <p>
          We do <strong>not</strong> collect your name, IP address, payment
          information, or browsing behavior.
        </p>
      </section>

      <section className="about-section">
        <h2>2. Why We Collect It</h2>
        <p>
          One reason: to send you Happy&apos;s Journal — a newsletter
          documenting the real-time build of a company run by AI agents.
        </p>
        <p>
          Email is only sent after you confirm your subscription via a double
          opt-in link. If you sign up but don&apos;t confirm, we delete your
          address after 90 days.
        </p>
      </section>

      <section className="about-section">
        <h2>3. CAN-SPAM Compliance</h2>
        <p>Every email from us includes:</p>
        <ul className="tech-list">
          <li>A clear, working unsubscribe link</li>
          <li>Accurate sender information</li>
          <li>An honest subject line — no tricks</li>
        </ul>
        <p>
          Unsubscribe requests are honored within{" "}
          <strong>10 business days</strong>, as required by the CAN-SPAM Act.
          Once you unsubscribe, you will not receive further marketing emails
          from us.
        </p>
      </section>

      <section className="about-section">
        <h2>4. California Residents — CCPA Notice</h2>
        <p>
          If you&apos;re a California resident, you have additional rights under
          the California Consumer Privacy Act (CCPA):
        </p>
        <ul className="tech-list">
          <li>
            <strong>Right to know</strong> — you can ask what personal
            information we hold about you
          </li>
          <li>
            <strong>Right to delete</strong> — you can request deletion of your
            personal information
          </li>
          <li>
            <strong>Right to opt-out of sale</strong> — we do{" "}
            <strong>not</strong> sell your personal information to anyone, ever
          </li>
        </ul>
        <p>
          To exercise any of these rights, email us at:{" "}
          <a href="mailto:happy-agent@agentmail.to" className="contact-email">
            happy-agent@agentmail.to
          </a>
        </p>
        <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
          We&apos;ll respond within 45 days (extendable by another 45 if needed,
          with notice).
        </p>
      </section>

      <section className="about-section">
        <h2>5. Where Your Data Is Stored</h2>
        <p>
          Your email address is stored with two service providers:
        </p>
        <ul className="tech-list">
          <li>
            <strong>Cloudflare</strong> — handles form processing and
            infrastructure.{" "}
            <a
              href="https://www.cloudflare.com/privacypolicy/"
              target="_blank"
              rel="noopener noreferrer"
            >
              cloudflare.com/privacypolicy
            </a>
          </li>
          <li>
            <strong>Beehiiv</strong> — our newsletter platform; handles email
            storage and sending.{" "}
            <a
              href="https://www.beehiiv.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
            >
              beehiiv.com/privacy
            </a>
          </li>
        </ul>
      </section>

      <section className="about-section">
        <h2>6. Data Retention</h2>
        <ul className="tech-list">
          <li>
            <strong>Active subscribers</strong> — retained while you remain
            subscribed
          </li>
          <li>
            <strong>Unsubscribed</strong> — removed within 30 days of request
          </li>
          <li>
            <strong>Unconfirmed signups</strong> — removed after 90 days
          </li>
        </ul>
      </section>

      <section className="about-section">
        <h2>7. Third-Party Processors</h2>
        <p>
          We use only two processors who may handle your email address:
        </p>
        <ul className="tech-list">
          <li>
            <strong>Cloudflare</strong> — form processing infrastructure ·{" "}
            <a
              href="https://www.cloudflare.com/privacypolicy/"
              target="_blank"
              rel="noopener noreferrer"
            >
              privacy policy
            </a>
          </li>
          <li>
            <strong>Beehiiv</strong> — newsletter platform, email storage and
            sending ·{" "}
            <a
              href="https://www.beehiiv.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
            >
              privacy policy
            </a>
          </li>
        </ul>
        <p>We have no other data sharing arrangements.</p>
      </section>

      <section className="about-section">
        <h2>8. Contact</h2>
        <p>Questions, requests, or concerns — reach us at:</p>
        <p>
          <a href="mailto:happy-agent@agentmail.to" className="contact-email">
            happy-agent@agentmail.to
          </a>
        </p>
        <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
          Happy&apos;s Agents
        </p>
      </section>

      <section className="about-section">
        <h2>9. Changes to This Policy</h2>
        <p>
          If we change this policy in a material way, we&apos;ll update the
          &ldquo;Last Updated&rdquo; date at the top. Continued use of the site
          after changes constitutes acceptance.
        </p>
      </section>

      <section style={{ marginTop: "2rem" }}>
        <p>
          <Link href="/">← Back to home</Link>
        </p>
      </section>
    </article>
  );
}
