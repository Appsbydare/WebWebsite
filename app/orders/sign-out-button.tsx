"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface SignOutButtonProps {
    variant?: "default" | "sidebar";
}

export function SignOutButton({ variant = "default" }: SignOutButtonProps) {
    const router = useRouter();

    const handleSignOut = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/");
        router.refresh();
    };

    const baseClass = "flex items-center gap-2 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-all text-xs font-semibold";
    const variantClass = variant === "sidebar"
        ? "w-full justify-center px-4 py-2.5 border border-white/10"
        : "px-4 py-2 border border-white/10 hover:border-white/20 backdrop-blur-sm";

    return (
        <button
            onClick={handleSignOut}
            className={`${baseClass} ${variantClass}`}
        >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
        </button>
    );
}
