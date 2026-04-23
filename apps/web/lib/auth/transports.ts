export type AuthChannel = "email" | "sms";

export type OtpDeliveryResult = {
  channel: AuthChannel;
  transport: "mock" | "smtp";
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
  return process.env.AUTH_EMAIL_FROM || process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "no-reply@example.com";
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

class SmtpEmailTransport {
  async send(input: SendOtpInput): Promise<OtpDeliveryResult> {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || "587");
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass) {
      throw new Error("smtp-not-configured");
    }

    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass
      }
    });

    const brandName = getBrandName();

    await transporter.sendMail({
      from: getEmailFromAddress(),
      to: input.identifier,
      subject: `کد ورود ${brandName}`,
      text: [
        `کد یکبارمصرف ورود شما در ${brandName}: ${input.code}`,
        "",
        `این کد تا ${input.expiresInMinutes} دقیقه معتبر است.`,
        "اگر این درخواست را شما ارسال نکرده‌اید، این پیام را نادیده بگیرید."
      ].join("\n"),
      html: `
        <div dir="rtl" style="font-family:Tahoma,Segoe UI,Arial,sans-serif;line-height:1.8;color:#1f2937">
          <h2 style="margin-bottom:8px">کد ورود ${brandName}</h2>
          <p>کد یکبارمصرف شما:</p>
          <p style="font-size:28px;font-weight:700;letter-spacing:4px">${input.code}</p>
          <p>این کد تا ${input.expiresInMinutes} دقیقه معتبر است.</p>
          <p style="color:#6b7280">اگر این درخواست را شما ارسال نکرده‌اید، این پیام را نادیده بگیرید.</p>
        </div>
      `
    });

    return {
      channel: "email",
      transport: "smtp",
      deliveredTo: input.identifier
    };
  }
}

const mockTransport = new MockOtpTransport();
const smtpEmailTransport = new SmtpEmailTransport();

export async function sendOtp(input: SendOtpInput) {
  if (input.channel === "sms") {
    return mockTransport.send(input);
  }

  const emailTransport = (process.env.AUTH_EMAIL_TRANSPORT || "mock").trim().toLowerCase();

  if (emailTransport === "smtp") {
    return smtpEmailTransport.send(input);
  }

  return mockTransport.send(input);
}

export function getAuthTransportInfo() {
  return {
    email: (process.env.AUTH_EMAIL_TRANSPORT || "mock").trim().toLowerCase(),
    sms: (process.env.AUTH_SMS_TRANSPORT || "mock").trim().toLowerCase()
  };
}
