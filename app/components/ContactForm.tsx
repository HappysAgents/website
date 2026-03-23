"use client";

import { useState } from "react";

interface FormData {
  name: string;
  company: string;
  industry: string;
  email: string;
  challenge: string;
  honeypot: string;
}

export default function ContactForm() {
  const [form, setForm] = useState<FormData>({
    name: "",
    company: "",
    industry: "",
    email: "",
    challenge: "",
    honeypot: "",
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.honeypot) return; // silently drop bots

    setStatus("submitting");
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          company: form.company,
          industry: form.industry,
          email: form.email,
          challenge: form.challenge,
        }),
      });

      if (!res.ok) throw new Error("Server error");
      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMsg("Something went wrong. Try emailing us directly at hello@happysagents.com");
    }
  };

  if (status === "success") {
    return (
      <div className="contact-form form-success">
        <div className="form-success-icon">✅</div>
        <h3 className="form-success-title">We&apos;ll be in touch within 24 hours.</h3>
        <p className="form-success-sub">
          We review every submission personally before responding.
        </p>
      </div>
    );
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      {/* Honeypot */}
      <input
        type="text"
        name="honeypot"
        value={form.honeypot}
        onChange={handleChange}
        style={{ position: "absolute", left: "-9999px", opacity: 0, pointerEvents: "none" }}
        tabIndex={-1}
        aria-hidden="true"
      />

      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="name">Your Name</label>
          <input
            id="name"
            name="name"
            type="text"
            className="form-input"
            placeholder="Nikos Papadopoulos"
            value={form.name}
            onChange={handleChange}
            required
            autoComplete="name"
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="company">Company</label>
          <input
            id="company"
            name="company"
            type="text"
            className="form-input"
            placeholder="Papadopoulos & Co"
            value={form.company}
            onChange={handleChange}
            required
            autoComplete="organization"
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="industry">Industry</label>
        <select
          id="industry"
          name="industry"
          className="form-select"
          value={form.industry}
          onChange={handleChange}
          required
        >
          <option value="" disabled>Select your industry</option>
          <option value="hospitality">Hospitality / Tourism</option>
          <option value="legal">Legal / Accounting</option>
          <option value="medical">Medical / Healthcare</option>
          <option value="real-estate">Real Estate</option>
          <option value="ecommerce">E-commerce / Retail</option>
          <option value="logistics">Logistics / Transport</option>
          <option value="construction">Construction / Engineering</option>
          <option value="education">Education</option>
          <option value="food">Food & Beverage</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="email">Email Address</label>
        <input
          id="email"
          name="email"
          type="email"
          className="form-input"
          placeholder="nikos@company.gr"
          value={form.email}
          onChange={handleChange}
          required
          autoComplete="email"
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="challenge">What would you like to automate or improve?</label>
        <textarea
          id="challenge"
          name="challenge"
          className="form-textarea"
          placeholder="e.g. We spend 3 hours a day manually responding to booking enquiries and updating our CRM..."
          value={form.challenge}
          onChange={handleChange}
          rows={4}
        />
      </div>

      <button
        type="submit"
        className="form-submit"
        disabled={status === "submitting"}
      >
        {status === "submitting" ? "Sending…" : "Book Free Strategy Consultation →"}
      </button>

      {status === "error" && (
        <p className="form-error-msg">{errorMsg}</p>
      )}
    </form>
  );
}
