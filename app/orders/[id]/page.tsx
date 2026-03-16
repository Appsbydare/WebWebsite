import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
    ChevronLeft, Package, Calendar, CheckCircle, ListChecks, CreditCard,
} from "lucide-react";

const PACKAGE_FEATURES: Record<string, string[]> = {
    "1 Day Package": ["2 High-Quality Pages", "Responsive Design", "Speed Optimization", "Smooth Animations"],
    "3 Day Package": ["5-7 Custom Pages", "Design System Setup", "Advanced Animations", "Content Integration", "Analytics Setup"],
};

const ADDONS: Record<string, { days: number }> = {
    "Payment Gateway": { days: 1 },
    "AI Support Agent": { days: 2 },
    "SEO & Performance": { days: 2 },
};

const PACKAGE_DAYS: Record<string, number> = {
    "1 Day Package": 1,
    "3 Day Package": 3,
};

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", {
        year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
    });
}

function addDays(date: Date, days: number) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
}

function parseFeatures(features: string | null): string[] {
    if (!features) return [];
    try {
        const parsed = JSON.parse(features);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return features.split(",").map((s) => s.trim()).filter(Boolean);
    }
}

function inferDeliveryDays(planName: string, storedDays: number | null): number {
    if (storedDays != null && storedDays > 0) return storedDays;
    const parts = planName.includes(" + ") ? planName.split(" + ").map((p) => p.trim()) : [planName];
    const base = parts[0] ?? "";
    let total = PACKAGE_DAYS[base] ?? 0;
    for (let i = 1; i < parts.length; i++) {
        const addon = ADDONS[parts[i]];
        if (addon) total += addon.days;
    }
    return total;
}

export default async function CustomerOrderDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: orders } = await supabase
        .from("orders")
        .select("id, plan_name, amount_usd, status, created_at, delivery_days, features")
        .eq("id", id)
        .eq("user_id", user.id)
        .limit(1);

    const order = orders?.[0] as {
        id: string;
        plan_name: string;
        amount_usd: number;
        status: string;
        created_at: string;
        delivery_days: number | null;
        features: string | null;
    } | undefined;

    if (!order) notFound();

    const featuresList = parseFeatures(order.features);
    const deliveryDays = inferDeliveryDays(order.plan_name, order.delivery_days);
    const orderDate = new Date(order.created_at);
    const deadline = deliveryDays > 0 ? addDays(orderDate, deliveryDays) : null;
    const isCustomPackage = order.plan_name.includes(" + ");
    const planParts = isCustomPackage ? order.plan_name.split(" + ").map((p) => p.trim()) : [order.plan_name];
    const basePackageName = planParts[0] ?? order.plan_name;
    const baseFeatures = PACKAGE_FEATURES[basePackageName] ?? [];
    const displayFeatures = featuresList.length > 0 ? featuresList : [...baseFeatures, ...planParts.slice(1)];

    const cardStyle = "rounded-2xl border border-white/10 p-6 backdrop-blur-xl";
    const cardBg = { background: "rgba(255,255,255,0.03)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)" } as const;

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <Link
                href="/orders"
                className="inline-flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-medium transition-colors"
            >
                <ChevronLeft className="w-4 h-4" />
                <span>Back to Orders</span>
            </Link>

            {/* Order header */}
            <div
                className={`relative ${cardStyle} overflow-hidden`}
                style={{
                    background: "linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(0,0,0,0.6) 60%, rgba(236,72,153,0.08) 100%)",
                    boxShadow: "0 0 80px rgba(124,58,237,0.15), inset 0 1px 0 rgba(255,255,255,0.06)",
                }}
            >
                <div className="absolute top-0 left-0 right-0 h-px"
                    style={{ background: "linear-gradient(90deg, transparent, #7c3aed, #a855f7, #ec4899, transparent)" }} />
                <div>
                    <p className="text-xs font-bold tracking-widest uppercase text-purple-400 mb-1">Order</p>
                    <h1 className="text-2xl font-black text-white">{order.plan_name}</h1>
                    <p className="text-white/90 text-sm mt-1">{formatDate(order.created_at)}</p>
                </div>
                <div className="mt-6 flex flex-wrap items-center gap-6">
                    <div>
                        <p className="text-2xl font-black text-white">${Number(order.amount_usd).toFixed(2)}</p>
                        <p className="text-white/90 text-xs">USD</p>
                    </div>
                    {deliveryDays > 0 && (
                        <div>
                            <p className="text-white font-semibold">{deliveryDays} Day{deliveryDays !== 1 ? "s" : ""} Delivery</p>
                            <p className="text-white/90 text-xs">Timeline</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Delivery deadline */}
            <div className={cardStyle} style={{ ...cardBg, background: "rgba(245,158,11,0.08)", borderColor: "rgba(245,158,11,0.3)" }}>
                <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-400" />
                    Delivery Deadline
                </h2>
                <div className="flex flex-wrap gap-6">
                    {deliveryDays > 0 && (
                        <div>
                            <p className="text-white/90 text-xs">Delivery timeline</p>
                            <p className="text-white font-bold text-lg">{deliveryDays} Day{deliveryDays !== 1 ? "s" : ""}</p>
                        </div>
                    )}
                    <div>
                        <p className="text-white/90 text-xs">Ordered</p>
                        <p className="text-white font-semibold">{formatDate(order.created_at)}</p>
                    </div>
                    <div>
                        <p className="text-white/90 text-xs">Deliver by</p>
                        <p className="text-white font-bold text-lg">
                            {deadline ? formatDate(deadline.toISOString()) : "N/A"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Package deliverables */}
            <div className={cardStyle} style={cardBg}>
                <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                    <ListChecks className="w-4 h-4 text-purple-400" />
                    What&apos;s Included
                </h2>
                {displayFeatures.length > 0 ? (
                    <ul className="space-y-3">
                        {displayFeatures.map((f, i) => (
                            <li key={i} className="flex items-start gap-3">
                                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                                <span className="text-white">{f}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-white/70">{order.plan_name}</p>
                )}
            </div>

            {/* Status */}
            <div className={cardStyle} style={cardBg}>
                <h2 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-purple-400" />
                    Payment
                </h2>
                <p className="text-white font-bold">${Number(order.amount_usd).toFixed(2)} USD</p>
                <p className="text-emerald-400 text-sm font-medium mt-1">Paid</p>
            </div>
        </div>
    );
}
