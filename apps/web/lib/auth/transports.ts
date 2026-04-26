import { Resend } from "resend";

export type AuthChannel = "email" | "sms";

export type OtpDeliveryResult = {
  channel: AuthChannel;
  transport: "mock" | "resend";
  deliveredTo: string;
  devCode?: string;
};

type SendOtpInput = {
  channel: AuthChannel;
  identifier: string;
  code: string;
  expiresInMinutes: number;
  requestId?: string;
};

function getBrandName() {
  return process.env.NEXT_PUBLIC_BRAND_NAME || "FumGPT";
}

function getEmailFromAddress() {
  const from = process.env.AUTH_EMAIL_FROM?.trim();

  if (!from) {
    throw new Error("auth-email-from-missing");
  }

  return from;
}

function getEmailReplyToAddress() {
  return process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() || undefined;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#39;";
      default:
        return char;
    }
  });
}

function buildOtpEmail(input: SendOtpInput) {
  const brandName = getBrandName();
  const safeBrandName = escapeHtml(brandName);
  const safeCode = escapeHtml(input.code);

  return {
    subject: `Your ${brandName} sign-in code`,
    text: [
      `Your one-time sign-in code for ${brandName} is ${input.code}.`,
      "",
      `This code expires in ${input.expiresInMinutes} minutes.`,
      "If you did not request this code, you can ignore this email."
    ].join("\n"),
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
        <h2 style="margin:0 0 12px">Your ${safeBrandName} sign-in code</h2>
        <p style="margin:0 0 12px">Use this one-time code to finish signing in:</p>
        <p style="font-size:28px;font-weight:700;letter-spacing:4px;margin:0 0 12px">${safeCode}</p>
        <p style="margin:0 0 12px">This code expires in ${input.expiresInMinutes} minutes.</p>
        <p style="color:#6b7280;margin:0">If you did not request this code, you can ignore this email.</p>
      </div>
    `
  };
}

function getEmailTransportName() {
  const configuredTransport = process.env.AUTH_EMAIL_TRANSPORT?.trim().toLowerCase();

  if (!configuredTransport && process.env.NODE_ENV === "production") {
    throw new Error("auth-email-transport-missing");
  }

  return configuredTransport || "mock";
}

class MockOtpTransport {
  async send(input: SendOtpInput): Promise<OtpDeliveryResult> {
    const requestTag = input.requestId ? ` requestId=${input.requestId}` : "";
    console.info(`[auth:${input.channel}:mock]${requestTag} ${input.identifier} -> ${input.code}`);

    return {
      channel: input.channel,
      transport: "mock",
      deliveredTo: input.identifier,
      devCode: process.env.NODE_ENV !== "production" ? input.code : undefined
    };
  }
}

class ResendEmailTransport {
  async send(input: SendOtpInput): Promise<OtpDeliveryResult> {
    const apiKey = process.env.RESEND_API_KEY?.trim();

    if (!apiKey) {
      throw new Error("resend-api-key-missing");
    }

    const resend = new Resend(apiKey);
    const email = buildOtpEmail(input);
    const replyTo = getEmailReplyToAddress();
    const idempotencyKey = input.requestId ? `auth-otp/${input.requestId}`.slice(0, 256) : undefined;

    const { data, error } = await resend.emails.send({
      from: getEmailFromAddress(),
      to: [input.identifier],
      subject: email.subject,
      text: email.text,
      html: email.html,
      ...(replyTo ? { replyTo } : {}),
      ...(idempotencyKey ? { idempotencyKey } : {})
    });

    if (error) {
      throw new Error(`resend-send-failed:${error.name}:${error.message}`);
    }

    if (!data?.id) {
      throw new Error("resend-send-failed:missing-message-id");
    }

    return {
      channel: "email",
      transport: "resend",
      deliveredTo: input.identifier
    };
  }
}

const mockTransport = new MockOtpTransport();
const resendEmailTransport = new ResendEmailTransport();

export async function sendOtp(input: SendOtpInput) {
  if (input.channel === "sms") {
    return mockTransport.send(input);
  }

  const emailTransport = getEmailTransportName();

  if (emailTransport === "mock") {
    return mockTransport.send(input);
  }

  if (emailTransport === "resend") {
    return resendEmailTransport.send(input);
  }

  throw new Error(`auth-email-transport-unsupported:${emailTransport}`);
}

export function getAuthTransportInfo() {
  const emailTransport = process.env.AUTH_EMAIL_TRANSPORT?.trim().toLowerCase();

  return {
    email: emailTransport || (process.env.NODE_ENV === "production" ? "not-configured" : "mock"),
    sms: (process.env.AUTH_SMS_TRANSPORT || "mock").trim().toLowerCase()
  };
}
