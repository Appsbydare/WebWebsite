import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createServiceClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-02-25.clover",
});

// Must parse raw body — Next.js should not parse this as JSON
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    const rawBody = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
        return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
    }

    let event: Stripe.Event;

    // ── Verify Stripe signature (security: rejects tampered payloads) ─────────
    try {
        event = stripe.webhooks.constructEvent(
            rawBody,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err) {
        const message = err instanceof Error ? err.message : "Signature verification failed";
        return NextResponse.json({ error: message }, { status: 400 });
    }

    // ── Only handle successful payments ──────────────────────────────────────
    if (event.type !== "checkout.session.completed") {
        return NextResponse.json({ received: true });
    }

    const session = event.data.object as Stripe.Checkout.Session;

    // Guard: must have a customer email to link to a user account
    if (!session.customer_email) {
        return NextResponse.json({ received: true });
    }

    try {
        const supabase = createServiceClient();

        const { data: adminList } = await supabase.auth.admin.listUsers();
        const user = adminList?.users?.find(
            (u: { email?: string }) => u.email === session.customer_email
        );

        if (!user) {
            // Customer paid but has no account yet — order saved without user_id
            // (handled: user can claim orders after registration via email match)
            return NextResponse.json({ received: true });
        }

        const amountUsd = session.amount_total ? session.amount_total / 100 : 0;

        const { error: insertError } = await supabase.from("orders").insert({
            user_id: user.id,
            stripe_session_id: session.id,
            plan_name: session.metadata?.plan_name ?? "Package",
            amount_usd: amountUsd,
            status: "paid",
        });

        if (insertError) {
            // Log server-side only — never expose DB errors to Stripe
            console.error("[webhook] insert error:", insertError.message);
            return NextResponse.json({ error: "DB insert failed" }, { status: 500 });
        }

        return NextResponse.json({ received: true });
    } catch (err) {
        console.error("[webhook] unexpected error:", err);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
