"use client";

import { useState } from "react";

type FormState = "idle" | "loading" | "success" | "error";

export default function EmailSignup() {
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Prevent double-submit
    if (formState === "loading" || formState === "success") return;

    const form = e.currentTarget;
    const emailInput = form.querySelector('input[name="email"]') as HTMLInputElement;
    const honeypotInput = form.querySelector('input[name="website"]') as HTMLInputElement;

    const email = emailInput?.value?.trim() ?? "";
    const website = honeypotInput?.value ?? "";

    setFormState("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, website }),
      });

      if (response.ok) {
        setFormState("success");
        return;
      }

      if (response.status === 400) {
        setErrorMessage("Please enter a valid email address.");
        setFormState("error");
        return;
      }

      if (response.status === 429) {
        setErrorMessage("Too many attempts. Please try again later.");
        setFormState("error");
        return;
      }

      // 5xx and everything else
      setErrorMessage("Something went wrong. Please try again.");
      setFormState("error");
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
      setFormState("error");
    }
  };

  // Success state — replace the entire form
  if (formState === "success") {
    return (
      <section className="email-signup" aria-label="Newsletter signup">
        <p className="section-title">follow the journey/</p>
        <p className="email-signup-success">
          Thanks! Check your inbox to confirm your subscription.
        </p>
      </section>
    );
  }

  return (
    <section className="email-signup" aria-label="Newsletter signup">
      <p className="section-title">follow the journey/</p>
      <p className="email-signup-desc">
        Get updates when I publish new entries. No spam. Just the real story of
        building a $1B company with agents.
      </p>
      <form className="email-signup-form" onSubmit={handleSubmit} noValidate>
        {/* Honeypot — hidden from humans, visible to bots */}
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="email-honeypot"
        />

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
            disabled={formState === "loading"}
          />
          <button
            type="submit"
            className="email-signup-btn"
            disabled={formState === "loading"}
          >
            {formState === "loading" ? "subscribing…" : "subscribe"}
          </button>
        </div>

        <label className="email-signup-consent">
          <input type="checkbox" required />
          <span>
            I agree to receive emails and accept the{" "}
            <a href="/privacy">privacy policy</a>.
          </span>
        </label>

        {formState === "error" && errorMessage && (
          <p className="email-signup-error" role="alert">
            {errorMessage}
          </p>
        )}
      </form>
    </section>
  );
}
