import type { Metadata } from "next";
import ContactForm from "./components/ContactForm";

const BASE_URL = "https://happysagents.com";

export const metadata: Metadata = {
  title: "Happy's Agents — OpenClaw Implementation for Greek SMBs",
  description:
    "We deploy OpenClaw AI agents for Greek businesses. Free 45-minute strategy session. No commitment, no tech knowledge required.",
  openGraph: {
    title: "Happy's Agents — OpenClaw Implementation for Greek SMBs",
    description:
      "We deploy OpenClaw AI agents for Greek businesses. Free 45-minute strategy session. No commitment, no tech knowledge required.",
    url: BASE_URL,
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Happy's Agents — OpenClaw Implementation for Greek SMBs",
    description:
      "We deploy OpenClaw AI agents for Greek businesses. Free 45-minute strategy session.",
    images: ["/og-image.png"],
  },
  alternates: { canonical: BASE_URL },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "Happy's Agents",
  url: BASE_URL,
  description: "OpenClaw AI agent implementation for Greek SMBs.",
  areaServed: { "@type": "Country", name: "Greece" },
  serviceType: "AI Agent Implementation",
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ─── HERO ──────────────────────────────── */}
      <section className="hero">
        <div className="container">
          <span className="hero-eyebrow">OpenClaw Implementation · Greece</span>
          <h1 className="hero-headline">
            Your business expertise.<br />
            Our <em>AI agents</em>.<br />
            Better results.
          </h1>
          <p className="hero-sub">
            We deploy OpenClaw AI agents tailored to your industry.
            Free 45-minute strategy session — no commitment, no technical
            knowledge required.
          </p>
          <div className="hero-cta-group">
            <a href="#contact" className="btn-primary">
              Book Free Consultation →
            </a>
            <a href="#how-it-works" className="btn-secondary">
              See how it works
            </a>
          </div>
        </div>
      </section>

      {/* ─── METRICS BAR ───────────────────────── */}
      <div className="metrics-bar">
        <div className="metrics-grid">
          <div className="metric-item">
            <span className="metric-value">Free</span>
            <span className="metric-label">45-min strategy session</span>
          </div>
          <div className="metric-item">
            <span className="metric-value">No obligation</span>
            <span className="metric-label">Zero commitment required</span>
          </div>
          <div className="metric-item">
            <span className="metric-value">2–4 weeks</span>
            <span className="metric-label">To first live workflow</span>
          </div>
          <div className="metric-item">
            <span className="metric-value">Athens</span>
            <span className="metric-label">Local, reachable, accountable</span>
          </div>
        </div>
      </div>

      {/* ─── WHO IT'S FOR ──────────────────────── */}
      <section className="section">
        <div className="container">
          <p className="section-label">Who it&apos;s for</p>
          <h2 className="section-title">
            Built for businesses that know their industry cold.
          </h2>
          <p className="section-sub">
            You have the domain expertise. We handle the automation.
          </p>

          <div className="who-grid">
            <div className="who-card">
              <div className="who-card-icon">🏨</div>
              <h3 className="who-card-title">Hospitality & Tourism</h3>
              <p className="who-card-desc">Bookings, guest comms, and reviews — handled automatically.</p>
            </div>
            <div className="who-card">
              <div className="who-card-icon">⚖️</div>
              <h3 className="who-card-title">Legal & Accounting</h3>
              <p className="who-card-desc">Client intake, document processing, and deadline tracking.</p>
            </div>
            <div className="who-card">
              <div className="who-card-icon">🏥</div>
              <h3 className="who-card-title">Medical & Healthcare</h3>
              <p className="who-card-desc">Scheduling, patient follow-ups, and admin — off your team&apos;s plate.</p>
            </div>
            <div className="who-card">
              <div className="who-card-icon">🏗️</div>
              <h3 className="who-card-title">Construction & Real Estate</h3>
              <p className="who-card-desc">Lead qualification, project updates, and document flow.</p>
            </div>
            <div className="who-card">
              <div className="who-card-icon">🛒</div>
              <h3 className="who-card-title">E-commerce & Retail</h3>
              <p className="who-card-desc">Customer support, order tracking, and marketing — running 24/7.</p>
            </div>
            <div className="who-card">
              <div className="who-card-icon">🚚</div>
              <h3 className="who-card-title">Logistics & Operations</h3>
              <p className="who-card-desc">Status updates, supplier coordination, and exception handling.</p>
            </div>
          </div>

          {/* Mid-funnel CTA */}
          <div className="section-cta">
            <p className="section-cta-text">Not sure if this applies to your business?</p>
            <a href="#contact" className="btn-primary">Book a free 15-min call →</a>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ──────────────────────── */}
      <section className="section section--alt" id="how-it-works">
        <div className="container">
          <p className="section-label">How it works</p>
          <h2 className="section-title">
            Four steps from first call to running agents.
          </h2>
          <p className="section-sub">
            No technical jargon. No long contracts upfront. Just a clear path
            from where you are to where you want to be.
          </p>

          <div className="process-steps">
            <div className="process-step">
              <span className="process-step-number">01</span>
              <h3 className="process-step-title">Discovery</h3>
              <p className="process-step-desc">
                Free 45-minute session. We map your workflows and identify
                exactly what can be automated in your specific business.
              </p>
            </div>
            <div className="process-step">
              <span className="process-step-number">02</span>
              <h3 className="process-step-title">Strategy</h3>
              <p className="process-step-desc">
                We design your agent architecture — which workflows to automate,
                in what order, with what integrations.
              </p>
            </div>
            <div className="process-step">
              <span className="process-step-number">03</span>
              <h3 className="process-step-title">Implementation</h3>
              <p className="process-step-desc">
                We build and deploy your agents. Your team gets onboarded.
                First live workflow typically in 2–4 weeks.
              </p>
            </div>
            <div className="process-step">
              <span className="process-step-number">04</span>
              <h3 className="process-step-title">Partnership</h3>
              <p className="process-step-desc">
                We stay involved as your business grows. Agents get refined,
                new workflows get added, and you stay ahead.
              </p>
            </div>
          </div>

          {/* CTA after process — intent peaks here */}
          <div className="section-cta">
            <a href="#contact" className="btn-primary btn-large">
              Start with a free Discovery session →
            </a>
          </div>
        </div>
      </section>

      {/* ─── WHAT WE DO — accordion style ─────── */}
      <section className="section">
        <div className="container">
          <p className="section-label">What we implement</p>
          <h2 className="section-title">
            The full stack of OpenClaw automation.
          </h2>

          <div className="services-grid">
            <div className="service-item">
              <div className="service-dot" />
              <div>
                <p className="service-title">Customer Communication Agents</p>
                <p className="service-desc">Inbound via WhatsApp, email, or web — qualify, respond, escalate in Greek and English.</p>
              </div>
            </div>
            <div className="service-item">
              <div className="service-dot" />
              <div>
                <p className="service-title">Operations & Admin Automation</p>
                <p className="service-desc">Documents, scheduling, reporting, task routing — running without manual intervention.</p>
              </div>
            </div>
            <div className="service-item">
              <div className="service-dot" />
              <div>
                <p className="service-title">Sales & Lead Intelligence</p>
                <p className="service-desc">Lead qualification, follow-up sequences, CRM updates — automated end to end.</p>
              </div>
            </div>
            <div className="service-item">
              <div className="service-dot" />
              <div>
                <p className="service-title">Content & Marketing Agents</p>
                <p className="service-desc">Social scheduling, newsletter drafts, SEO content — consistent without a full-time team.</p>
              </div>
            </div>
            <div className="service-item">
              <div className="service-dot" />
              <div>
                <p className="service-title">Multi-Agent Orchestration</p>
                <p className="service-desc">Teams of specialised agents that hand off tasks to each other — no human in the loop.</p>
              </div>
            </div>
            <div className="service-item">
              <div className="service-dot" />
              <div>
                <p className="service-title">Ongoing Optimisation</p>
                <p className="service-desc">Regular performance reviews, prompt iteration, and workflow improvements as you grow.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── WHY US ────────────────────────────── */}
      <section className="section section--alt">
        <div className="container">
          <p className="section-label">Why us</p>
          <h2 className="section-title">
            We&apos;re operators, not consultants.
          </h2>
          <p className="section-sub">
            We run OpenClaw agents ourselves, every day. What we deploy for you,
            we&apos;ve already built and broken in production.
          </p>

          <div className="why-list">
            <div className="why-item">
              <div className="why-check" />
              <div>
                <p className="why-content-title">Built from production experience</p>
                <p className="why-content-desc">We know what breaks, what scales, and what the docs don&apos;t tell you.</p>
              </div>
            </div>
            <div className="why-item">
              <div className="why-check" />
              <div>
                <p className="why-content-title">Partner model, not service model</p>
                <p className="why-content-desc">We stay involved long-term. Your success is how we measure ours.</p>
              </div>
            </div>
            <div className="why-item">
              <div className="why-check" />
              <div>
                <p className="why-content-title">No technical knowledge needed</p>
                <p className="why-content-desc">You know your business. We handle every technical aspect end to end.</p>
              </div>
            </div>
            <div className="why-item">
              <div className="why-check" />
              <div>
                <p className="why-content-title">Local and accountable</p>
                <p className="why-content-desc">Athens-based. You talk to the people who built your system, not a support queue.</p>
              </div>
            </div>
          </div>

          {/* CTA after why-us */}
          <div className="section-cta section-cta--left">
            <a href="#contact" className="btn-primary">
              See if we&apos;re the right fit →
            </a>
          </div>
        </div>
      </section>

      {/* ─── SOCIAL PROOF BAND ─────────────────── */}
      <section className="proof-band">
        <div className="container">
          <p className="proof-text">
            We run the same OpenClaw stack we deploy for clients — in production, every day.
            Built in Athens. Serving Greece.
          </p>
          <div className="proof-logos">
            <span className="proof-logo-item">OpenClaw</span>
            <span className="proof-divider">·</span>
            <span className="proof-logo-item">Anthropic Claude</span>
            <span className="proof-divider">·</span>
            <span className="proof-logo-item">Cloudflare</span>
            <span className="proof-divider">·</span>
            <span className="proof-logo-item">WhatsApp Business</span>
            <span className="proof-divider">·</span>
            <span className="proof-logo-item">Telegram</span>
          </div>
        </div>
      </section>

      {/* ─── CONTACT ───────────────────────────── */}
      <section className="contact-section" id="contact">
        <div className="contact-inner">
          <div>
            <p className="section-label">Get started</p>
            <h2 className="contact-left-title">
              Tell us about your business.
            </h2>
            <p className="contact-left-sub">
              We review every submission personally and respond within 24 hours
              to schedule your free 45-minute strategy session.
            </p>
            <div className="contact-promise">
              <div className="contact-promise-item">
                <span>✓</span>
                <span><strong>No sales pitch.</strong> An honest conversation about what&apos;s automatable in your business.</span>
              </div>
              <div className="contact-promise-item">
                <span>✓</span>
                <span><strong>No commitment required.</strong> The consultation is free with no obligation to proceed.</span>
              </div>
              <div className="contact-promise-item">
                <span>✓</span>
                <span><strong>No tech knowledge needed.</strong> You know your business. We handle the rest.</span>
              </div>
            </div>
          </div>

          <ContactForm />
        </div>
      </section>

      {/* ─── STICKY MOBILE CTA ─────────────────── */}
      <div className="sticky-cta" aria-hidden="true">
        <a href="#contact" className="sticky-cta-btn">
          Free Consultation — No Commitment →
        </a>
      </div>
    </>
  );
}
