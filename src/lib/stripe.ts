import Stripe from "stripe";

const secret = process.env.STRIPE_SECRET_KEY;
export const stripe = secret ? new Stripe(secret) : null;

export const STRIPE_PRICE_SPRINT = process.env.STRIPE_PRICE_SPRINT ?? "";
export const STRIPE_PRICE_PRO = process.env.STRIPE_PRICE_PRO ?? "";
