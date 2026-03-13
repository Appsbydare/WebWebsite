"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, LogOut, ShoppingBag, ChevronDown, LogIn } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface NavUserMenuProps {
    /** gradient style string passed in from the nav so it matches the live neon colours */
    navGradient: string;
    isDark: boolean;
}

export default function NavUserMenu({ navGradient, isDark }: NavUserMenuProps) {
    const router = useRouter();
    const [user, setUser] = useState<SupabaseUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // ── Fetch session on mount and subscribe to auth changes ─────────────────
    useEffect(() => {
        const supabase = createClient();

        supabase.auth.getUser().then(({ data: { user } }) => {
            setUser(user);
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    // ── Close dropdown when clicking outside ─────────────────────────────────
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleSignOut = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        setDropdownOpen(false);
        router.push("/");
        router.refresh();
    };

    const displayName = user?.user_metadata?.full_name?.split(" ")[0]
        ?? user?.email?.split("@")[0]
        ?? "Account";

    if (loading) {
        // Skeleton pill so layout doesn't shift
        return <div className="hidden sm:block w-24 h-9 rounded-full bg-white/10 animate-pulse" />;
    }

    // ── Logged OUT: show Login button ─────────────────────────────────────────
    if (!user) {
        return (
            <Link
                href="/login"
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-semibold hover:opacity-90 transition-all shadow-md hover:shadow-lg"
                style={{ background: navGradient }}
            >
                <LogIn className="w-4 h-4" />
                Login
            </Link>
        );
    }

    // ── Logged IN: account avatar + dropdown ──────────────────────────────────
    return (
        <div ref={dropdownRef} className="relative hidden sm:block">
            <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold transition-all hover:scale-[1.02] ${
                    isDark
                        ? "bg-white/10 hover:bg-white/15 text-white border border-white/10"
                        : "bg-black/5 hover:bg-black/10 text-black border border-black/10"
                }`}
            >
                {/* Avatar circle */}
                <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ background: navGradient }}
                >
                    {displayName[0].toUpperCase()}
                </span>
                <span className="max-w-[80px] truncate">{displayName}</span>
                <ChevronDown className={`w-3.5 h-3.5 opacity-60 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown */}
            {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl bg-black/90 border border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden z-[99999] animate-in fade-in slide-in-from-top-2 duration-150">
                    {/* User info header */}
                    <div className="px-4 py-3 border-b border-white/10">
                        <p className="text-xs text-white/40 font-medium">Signed in as</p>
                        <p className="text-sm text-white font-semibold truncate">{user.email}</p>
                    </div>

                    {/* Menu items */}
                    <div className="p-1.5 space-y-0.5">
                        <Link
                            href="/orders"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-white/80 hover:text-white hover:bg-white/10 transition-all"
                        >
                            <ShoppingBag className="w-4 h-4 text-purple-400 flex-shrink-0" />
                            Customer Portal
                        </Link>

                        <button
                            onClick={handleSignOut}
                            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-white/80 hover:text-white hover:bg-white/10 transition-all text-left"
                        >
                            <LogOut className="w-4 h-4 text-red-400 flex-shrink-0" />
                            Sign Out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
