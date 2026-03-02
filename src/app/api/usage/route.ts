import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { setRoute } from "@/lib/sentry";
import { getUsage } from "@/lib/db";
import { isFullAppEnabled, isDatabaseAvailable } from "@/lib/feature-config";

export async function GET(request: NextRequest) {
  setRoute("api_usage");
  try {
    if (isFullAppEnabled() && !isDatabaseAvailable()) {
      return NextResponse.json(
        { error: "Usage service unavailable" },
        { status: 503 }
      );
    }

    const sessionId = request.nextUrl.searchParams.get("sessionId");
    if (sessionId) {
      const usage = await getUsage(sessionId);
      if (usage) {
        return NextResponse.json(usage);
      }
    }
    return NextResponse.json({
      scanCount: 0,
      purchasedScans: 0,
    });
  } catch (err) {
    Sentry.captureException(err);
    return NextResponse.json(
      { error: "Usage check failed" },
      { status: 500 }
    );
  }
}
