import { getContentSourceInfo } from "@/lib/content";

export async function GET() {
  const contentSource = getContentSourceInfo();

  return Response.json({
    status: "ok",
    app: "fumgpt-storefront",
    phase: 1,
    timestamp: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV || "development",
    cmsMode: contentSource.cmsMode,
    authMode: "mock-session"
  });
}
