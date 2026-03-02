import { NextRequest, NextResponse } from "next/server";
import { getUsage } from "@/lib/db";

const SESSION_COOKIE = "rgs_session";

export async function GET(request: NextRequest) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  if (!sessionId) {
    return NextResponse.json({ scanCount: 0, hasSubscription: false });
  }

  const usage = await getUsage(sessionId);
  if (!usage) {
    return NextResponse.json({ scanCount: 0, hasSubscription: false });
  }

  return NextResponse.json(usage);
}
