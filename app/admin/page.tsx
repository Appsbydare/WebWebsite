import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import {
    Package, ChevronRight,
    CheckCircle, AlertCircle, User, Mail, ArrowUpRight,
} from "lucide-react";
import AdminOrdersList from "./admin-orders-list";

interface AdminOrder {
    id: string;
    user_id: string | null;
    stripe_session_id: string;
    plan_name: string;
    amount_usd: number;
    status: "paid" | "refunded" | "disputed";
    created_at: string;
    delivery_days: number | null;
    features: string | null;
    customer_email: string | null;
    customer_name: string | null;
}

const STATUS_CONFIG = {
    paid: { label: "Paid", icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
    refunded: { label: "Refunded", icon: AlertCircle, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
    disputed: { label: "Disputed", icon: AlertCircle, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
};

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", {
        year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    });
}

function addDays(date: Date, days: number) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
}

/** Group orders by day for last 7 days, return daily totals */
function getRevenueByDay(orders: AdminOrder[]) {
    const now = new Date();
    const days: { date: string; total: number; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        d.setHours(0, 0, 0, 0);
        const next = new Date(d);
        next.setDate(next.getDate() + 1);
        const dayOrders = orders.filter((o) => {
            const created = new Date(o.created_at);
            return created >= d && created < next && o.status === "paid";
        });
        const total = dayOrders.reduce((s, o) => s + Number(o.amount_usd), 0);
        days.push({
            date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            total,
            count: dayOrders.length,
        });
    }
    return days;
}

export default async function AdminPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const serviceClient = createServiceClient();
    const { data: adminCheck } = await serviceClient
        .from("admin_users")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();
    if (!adminCheck) redirect("/");

    const { data: orders, error } = await serviceClient
        .from("admin_orders_view")
        .select("*")
        .order("created_at", { ascending: false });

    const adminOrders = (orders ?? []) as AdminOrder[];
    const totalRevenue = adminOrders.filter((o) => o.status === "paid").reduce((s, o) => s + Number(o.amount_usd), 0);
    const revenueByDay = getRevenueByDay(adminOrders);
    const maxDayRevenue = Math.max(...revenueByDay.map((d) => d.total), 1);

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Page header */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Dashboard</h1>
                <p className="text-white/70 text-sm mt-1">Overview of your orders and revenue</p>
            </div>

            {/* Stats grid – gradient adapts to card position */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { label: "ORDERS", value: adminOrders.length.toString(), sub: "Total Orders", pos: 0 },
                    { label: "REVENUE", value: `$${totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, sub: "USD (Paid)", pos: 1 },
                    { label: "LATEST", value: adminOrders[0] ? formatDate(adminOrders[0].created_at).split(",")[0] : "—", sub: "Last Order", pos: 2 },
                ].map(({ label, value, sub, pos }) => {
                    const gradients = [
                        { bg: "linear-gradient(135deg, rgba(124,58,237,0.18) 0%, rgba(0,0,0,0.5) 50%, rgba(139,92,246,0.06) 100%)", bar: "linear-gradient(90deg, #7c3aed, #8b5cf6, transparent)", glow: "rgba(124,58,237,0.2)" },
                        { bg: "linear-gradient(135deg, rgba(124,58,237,0.1) 0%, rgba(0,0,0,0.55) 50%, rgba(236,72,153,0.1) 100%)", bar: "linear-gradient(90deg, transparent, #7c3aed, #ec4899, transparent)", glow: "rgba(168,85,247,0.18)" },
                        { bg: "linear-gradient(135deg, rgba(168,85,247,0.06) 0%, rgba(0,0,0,0.5) 50%, rgba(236,72,153,0.18) 100%)", bar: "linear-gradient(90deg, transparent, #a855f7, #ec4899)", glow: "rgba(236,72,153,0.2)" },
                    ];
                    const g = gradients[pos];
                    return (
                        <div
                            key={label}
                            className="relative rounded-3xl border border-white/10 p-5 sm:p-6 overflow-hidden backdrop-blur-2xl transition-all hover:border-white/15"
                            style={{
                                background: g.bg,
                                boxShadow: `0 0 80px ${g.glow}, inset 0 1px 0 rgba(255,255,255,0.06)`,
                            }}
                        >
                            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: g.bar }} />
                            <p className="text-xs font-bold tracking-widest uppercase text-purple-400 mb-1">{label}</p>
                            <p className={`font-black text-white leading-none ${label === "LATEST" ? "text-2xl" : "text-3xl"}`}>{value}</p>
                            <p className="text-white/70 text-sm mt-1">{sub}</p>
                        </div>
                    );
                })}
            </div>

            {/* Revenue trend */}
            <div
                className="rounded-2xl border border-white/10 p-5 sm:p-6 backdrop-blur-xl"
                style={{ background: "rgba(255,255,255,0.03)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)" }}
            >
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold text-white">Revenue (Last 7 Days)</h2>
                    <span className="text-white/60 text-xs">Daily total</span>
                </div>
                <div className="flex items-end gap-2 sm:gap-3 h-24">
                    {revenueByDay.map((day) => (
                        <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                            <div
                                className="w-full rounded-t-lg min-h-[4px] transition-all duration-500"
                                style={{
                                    height: `${Math.max(4, (day.total / maxDayRevenue) * 80)}px`,
                                    background: "linear-gradient(180deg, #7c3aed, #a855f7)",
                                    opacity: day.total > 0 ? 0.9 : 0.2,
                                }}
                            />
                            <div className="text-center">
                                <p className="text-white/90 text-xs font-medium">${day.total.toFixed(0)}</p>
                                <p className="text-white/50 text-[10px]">{day.date}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Orders section */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold text-white">Recent Orders</h2>
                    {adminOrders.length > 0 && (
                        <span className="text-white/60 text-sm">{adminOrders.length} total</span>
                    )}
                </div>

                {error && (
                    <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                        Could not load orders. Please refresh.
                    </div>
                )}

                {adminOrders.length === 0 && !error && (
                    <div
                        className="rounded-2xl border border-white/10 p-12 text-center backdrop-blur-xl"
                        style={{ background: "rgba(255,255,255,0.02)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)" }}
                    >
                        <Package className="w-12 h-12 text-white/40 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-white mb-2">No orders yet</h3>
                        <p className="text-white/60 text-sm max-w-sm mx-auto">
                            Orders will appear here once customers complete checkout.
                        </p>
                    </div>
                )}

                {adminOrders.length > 0 && (
                    <AdminOrdersList orders={adminOrders} />
                )}
            </div>
        </div>
    );
}
