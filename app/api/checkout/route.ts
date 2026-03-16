import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";
import { checkRateLimit } from "@/lib/rate-limit";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-02-25.clover",
});

const PRICE_IDS: Record<string, string> = {
    "1day": process.env.STRIPE_PRICE_1DAY!,
    "3day": process.env.STRIPE_PRICE_3DAY!,
};

const PLAN_NAMES: Record<string, string> = {
    "1day": "1 Day Package",
    "3day": "3 Day Package",
};

function getClientId(req: NextRequest): string {
    return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
        ?? req.headers.get("x-real-ip")
        ?? "unknown";
}

export async function POST(req: NextRequest) {
    const clientId = getClientId(req);
    const { ok } = checkRateLimit(clientId, "checkout");
    if (!ok) {
        return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    try {
        const body = await req.json();
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

        // Prefer logged-in user email, fall back to what the modal collected
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        const customerEmail: string | undefined = user?.email ?? body.customerEmail ?? undefined;

        let sessionParams: Stripe.Checkout.SessionCreateParams;

        const deliveryDays = body.deliveryDays ?? 0;
        const featuresJson = Array.isArray(body.features) ? JSON.stringify(body.features) : (body.features ?? "[]");

        if (body.planId && PRICE_IDS[body.planId]) {
            sessionParams = {
                mode: "payment",
                customer_email: customerEmail,
                line_items: [{ price: PRICE_IDS[body.planId], quantity: 1 }],
                metadata: {
                    plan_name: PLAN_NAMES[body.planId] ?? body.planId,
                    customer_name: body.customerName ?? "",
                    delivery_days: String(deliveryDays),
                    features: featuresJson,
                },
                success_url: `${baseUrl}/?payment=success`,
                cancel_url: `${baseUrl}/?payment=cancelled`,
            };
        } else if (body.name && body.amount) {
            sessionParams = {
                mode: "payment",
                customer_email: customerEmail,
                line_items: [
                    {
                        price_data: {
                            currency: "usd",
                            unit_amount: Math.round(body.amount * 100),
                            product_data: {
                                name: body.name,
                                description: body.description || undefined,
                            },
                        },
                        quantity: 1,
                    },
                ],
                metadata: {
                    plan_name: body.name,
                    customer_name: body.customerName ?? "",
                    delivery_days: String(deliveryDays),
                    features: featuresJson,
                },
                success_url: `${baseUrl}/?payment=success`,
                cancel_url: `${baseUrl}/?payment=cancelled`,
            };
        } else {
            return NextResponse.json(
                { error: "Invalid request: provide planId or name+amount" },
                { status: 400 }
            );
        }

        const session = await stripe.checkout.sessions.create(sessionParams);
        return NextResponse.json({ url: session.url });
    } catch (error) {
        logger.error("[checkout] error:", error);
        return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
    }
}
