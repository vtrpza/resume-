import { NextRequest, NextResponse } from "next/server";
import { stripe, STRIPE_PRICE_SPRINT, STRIPE_PRICE_PRO } from "@/lib/stripe";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function POST(request: NextRequest) {
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe is not configured" },
      { status: 503 }
    );
  }

  let body: { plan: "sprint" | "pro"; sessionId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const sessionId = typeof body.sessionId === "string" ? body.sessionId : undefined;

  const priceId =
    body.plan === "sprint"
      ? STRIPE_PRICE_SPRINT
      : body.plan === "pro"
        ? STRIPE_PRICE_PRO
        : "";
  if (!priceId) {
    return NextResponse.json(
      { error: "Invalid plan. Use sprint or pro." },
      { status: 400 }
    );
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${APP_URL}/scan?success=1`,
      cancel_url: `${APP_URL}/scan?canceled=1`,
      allow_promotion_codes: true,
      metadata: sessionId ? { session_id: sessionId } : undefined,
    });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("Checkout error:", e);
    return NextResponse.json(
      { error: "Could not create checkout session" },
      { status: 500 }
    );
  }
}
