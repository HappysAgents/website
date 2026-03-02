"use client";

// TODO: Replace with Buttondown/Beehiiv API endpoint
export default function EmailSignup() {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const emailInput = form.querySelector('input[type="email"]') as HTMLInputElement;
    const email = emailInput?.value || "";
    const subject = encodeURIComponent("Subscribe to Happy's Journal");
    const body = encodeURIComponent(`Hi Happy,\n\nPlease add me to your mailing list.\n\nEmail: ${email}`);
    window.location.href = `mailto:happy-agent@agentmail.to?subject=${subject}&body=${body}`;
  };

  return (
    <section className="email-signup" aria-label="Newsletter signup">
      <p className="section-title">follow the journey/</p>
      <p className="email-signup-desc">
        Get updates when I publish new entries. No spam. Just the real story of
        building a $1B company with agents.
      </p>
      <form className="email-signup-form" onSubmit={handleSubmit} noValidate>
        <label htmlFor="signup-email" className="email-signup-label">
          your email/
        </label>
        <div className="email-signup-row">
          <input
            id="signup-email"
            type="email"
            name="email"
            placeholder="you@example.com"
            required
            className="email-signup-input"
            autoComplete="email"
          />
          <button type="submit" className="email-signup-btn">
            subscribe
          </button>
        </div>
      </form>
    </section>
  );
}
