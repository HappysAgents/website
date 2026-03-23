import type { Metadata } from "next";
import ContactForm from "./components/ContactForm";

const BASE_URL = "https://happysagents.com";

export const metadata: Metadata = {
  title: "Happy's Agents — OpenClaw Implementation for Greek SMBs",
  description:
    "We deploy OpenClaw AI agents for Greek businesses. Free strategy consultation — we only proceed if we can make or save you money.",
  openGraph: {
    title: "Happy's Agents — OpenClaw Implementation for Greek SMBs",
    description:
      "We deploy OpenClaw AI agents for Greek businesses. Free strategy consultation — we only proceed if we can make or save you money.",
    url: BASE_URL,
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Happy's Agents — OpenClaw Implementation for Greek SMBs",
    description:
      "We deploy OpenClaw AI agents for Greek businesses. Free strategy consultation — we only proceed if we can make or save you money.",
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
            Free strategy consultation — we only move forward if we can
            demonstrably make or save you money.
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
            <span className="metric-label">Strategy Consultation</span>
          </div>
          <div className="metric-item">
            <span className="metric-value">ROI-first</span>
            <span className="metric-label">We prove value before you pay</span>
          </div>
          <div className="metric-item">
            <span className="metric-value">Partner</span>
            <span className="metric-label">Not a service provider</span>
          </div>
          <div className="metric-item">
            <span className="metric-value">Local</span>
            <span className="metric-label">Athens, Greece</span>
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
            You have deep domain expertise and real operations. You don&apos;t need
            to understand AI — you need it to work for your specific business.
          </p>

          <div className="who-grid">
            <div className="who-card">
              <div className="who-card-icon">🏨</div>
              <h3 className="who-card-title">Hospitality & Tourism</h3>
              <p className="who-card-desc">
                Automate booking enquiries, guest communication, review management,
                and seasonal pricing — without adding headcount.
              </p>
            </div>
            <div className="who-card">
              <div className="who-card-icon">⚖️</div>
              <h3 className="who-card-title">Legal & Accounting Firms</h3>
              <p className="who-card-desc">
                Document processing, client intake, deadline tracking,
                and routine client communication — handled autonomously.
              </p>
            </div>
            <div className="who-card">
              <div className="who-card-icon">🏥</div>
              <h3 className="who-card-title">Medical & Healthcare</h3>
              <p className="who-card-desc">
                Appointment scheduling, patient follow-ups, administrative
                triage — so your team focuses on care, not admin.
              </p>
            </div>
            <div className="who-card">
              <div className="who-card-icon">🏗️</div>
              <h3 className="who-card-title">Construction & Real Estate</h3>
              <p className="who-card-desc">
                Lead qualification, project status updates, document
                management, and supplier coordination — automated end-to-end.
              </p>
            </div>
            <div className="who-card">
              <div className="who-card-icon">🛒</div>
              <h3 className="who-card-title">E-commerce & Retail</h3>
              <p className="who-card-desc">
                Customer support, inventory alerts, order tracking,
                and marketing automation — running 24/7.
              </p>
            </div>
            <div className="who-card">
              <div className="who-card-icon">🚚</div>
              <h3 className="who-card-title">Logistics & Operations</h3>
              <p className="who-card-desc">
                Route communication, status updates, exception handling,
                and supplier coordination — without manual intervention.
              </p>
            </div>
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
            No long contracts before we&apos;ve proven value. No technical jargon.
            Just a clear path from where you are to where you want to be.
          </p>

          <div className="process-steps">
            <div className="process-step">
              <span className="process-step-number">01</span>
              <h3 className="process-step-title">Discovery</h3>
              <p className="process-step-desc">
                Free 45-minute session. We map your workflows, identify where
                time and money are being lost, and assess what&apos;s automatable
                in your specific context.
              </p>
            </div>
            <div className="process-step">
              <span className="process-step-number">02</span>
              <h3 className="process-step-title">ROI Analysis</h3>
              <p className="process-step-desc">
                We model the numbers honestly. Hours saved, revenue opportunities,
                cost reductions. If the case isn&apos;t clear, we tell you —
                no pitch, no pressure.
              </p>
            </div>
            <div className="process-step">
              <span className="process-step-number">03</span>
              <h3 className="process-step-title">Implementation</h3>
              <p className="process-step-desc">
                We configure and deploy OpenClaw agents tailored to your operations.
                Your team learns to work alongside them. Timeline: typically
                2–4 weeks to first live workflow.
              </p>
            </div>
            <div className="process-step">
              <span className="process-step-number">04</span>
              <h3 className="process-step-title">Partnership</h3>
              <p className="process-step-desc">
                We stay involved. As your business evolves, so do your agents.
                We&apos;re incentivised by your results — not by selling you more
                hours.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── WHAT WE DO ────────────────────────── */}
      <section className="section">
        <div className="container">
          <p className="section-label">What we implement</p>
          <h2 className="section-title">
            The full stack of OpenClaw automation.
          </h2>
          <p className="section-sub">
            Every implementation is different. These are the capabilities
            we deploy most often for Greek SMBs.
          </p>

          <div className="services-grid">
            <div className="service-item">
              <div className="service-dot" />
              <div>
                <p className="service-title">Customer Communication Agents</p>
                <p className="service-desc">
                  Handle inbound enquiries via WhatsApp, email, or web — qualify,
                  respond, escalate. Works across Greek and English.
                </p>
              </div>
            </div>
            <div className="service-item">
              <div className="service-dot" />
              <div>
                <p className="service-title">Operations & Admin Automation</p>
                <p className="service-desc">
                  Document processing, scheduling, reporting, and task routing
                  that runs without anyone touching it.
                </p>
              </div>
            </div>
            <div className="service-item">
              <div className="service-dot" />
              <div>
                <p className="service-title">Sales & Lead Intelligence</p>
                <p className="service-desc">
                  Lead qualification, follow-up sequences, CRM updates, and
                  pipeline monitoring — automated end to end.
                </p>
              </div>
            </div>
            <div className="service-item">
              <div className="service-dot" />
              <div>
                <p className="service-title">Content & Marketing Agents</p>
                <p className="service-desc">
                  Social media scheduling, newsletter drafts, SEO content —
                  produced consistently without a full-time team.
                </p>
              </div>
            </div>
            <div className="service-item">
              <div className="service-dot" />
              <div>
                <p className="service-title">Multi-Agent Orchestration</p>
                <p className="service-desc">
                  When one agent isn&apos;t enough — we architect teams of
                  specialised agents that hand off tasks to each other.
                </p>
              </div>
            </div>
            <div className="service-item">
              <div className="service-dot" />
              <div>
                <p className="service-title">Monitoring & Ongoing Optimisation</p>
                <p className="service-desc">
                  Regular reviews of agent performance, prompt iteration,
                  and workflow improvements as your business changes.
                </p>
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
            We run OpenClaw agents ourselves, every day, to operate our own
            business. What we implement for you, we&apos;ve already battle-tested.
          </p>

          <div className="why-list">
            <div className="why-item">
              <div className="why-check" />
              <div>
                <p className="why-content-title">Free until it&apos;s proven</p>
                <p className="why-content-desc">
                  The strategy consultation is free. We only propose implementation
                  when the ROI case is clear. No spec-to-invoice cycle before
                  you&apos;ve seen value.
                </p>
              </div>
            </div>
            <div className="why-item">
              <div className="why-check" />
              <div>
                <p className="why-content-title">Partner model, not service model</p>
                <p className="why-content-desc">
                  We&apos;re paid on results, not hours. That means we&apos;re
                  aligned with you — if your agents aren&apos;t delivering,
                  that&apos;s our problem to fix.
                </p>
              </div>
            </div>
            <div className="why-item">
              <div className="why-check" />
              <div>
                <p className="why-content-title">Built on real production experience</p>
                <p className="why-content-desc">
                  We run multi-agent systems in production daily. We know what
                  breaks, what scales, and what the documentation doesn&apos;t
                  tell you.
                </p>
              </div>
            </div>
            <div className="why-item">
              <div className="why-check" />
              <div>
                <p className="why-content-title">Local, reachable, accountable</p>
                <p className="why-content-desc">
                  Based in Athens. You&apos;re not emailing a support queue — you&apos;re
                  talking to the people who built your system.
                </p>
              </div>
            </div>
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
              We review every submission personally. If we see an opportunity,
              we&apos;ll reach out within 24 hours to schedule a free 45-minute
              strategy session.
            </p>
            <div className="contact-promise">
              <div className="contact-promise-item">
                <span>✓</span>
                <span><strong>No sales pitch.</strong> Just an honest conversation about what&apos;s automatable in your business.</span>
              </div>
              <div className="contact-promise-item">
                <span>✓</span>
                <span><strong>No commitment required.</strong> The consultation is free and there&apos;s no obligation to proceed.</span>
              </div>
              <div className="contact-promise-item">
                <span>✓</span>
                <span><strong>No technical knowledge needed.</strong> You know your business. We handle the rest.</span>
              </div>
            </div>
          </div>

          <ContactForm />
        </div>
      </section>
    </>
  );
}
