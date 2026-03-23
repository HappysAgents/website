import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

interface ContactPayload {
  name: string;
  company: string;
  industry: string;
  email: string;
  challenge: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ContactPayload;

    const { name, company, industry, email, challenge } = body;

    // Basic validation
    if (!name || !company || !email || !industry) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    // Forward to AgentMail if configured
    const AGENTMAIL_API_KEY = process.env.AGENTMAIL_API_KEY;
    const AGENTMAIL_INBOX = process.env.AGENTMAIL_INBOX || "happy-agent@agentmail.to";

    if (AGENTMAIL_API_KEY) {
      await fetch("https://api.agentmail.to/v0/inboxes/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${AGENTMAIL_API_KEY}`,
        },
        body: JSON.stringify({
          inbox: AGENTMAIL_INBOX,
          subject: `New consultation request — ${company} (${industry})`,
          text: [
            `Name: ${name}`,
            `Company: ${company}`,
            `Industry: ${industry}`,
            `Email: ${email}`,
            ``,
            `What they want to automate:`,
            challenge || "(not provided)",
          ].join("\n"),
        }),
      });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
