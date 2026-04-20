export async function GET() {
  return Response.json({
    commerce: process.env.NEXT_PUBLIC_ENABLE_REAL_COMMERCE === "true" ? "connected" : "mock",
    paymentProvider: process.env.PAYMENT_PROVIDER || "planned",
    smsProvider: process.env.SMS_PROVIDER || "planned"
  });
}
