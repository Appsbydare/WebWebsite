import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

export async function middleware(req: NextRequest) {
    const res = NextResponse.next();

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return req.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        req.cookies.set(name, value);
                        res.cookies.set(name, value, options);
                    });
                },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();

    // Protect /admin — server-side authorization via admin_users table
    if (req.nextUrl.pathname.startsWith("/admin")) {
        if (!user) {
            const loginUrl = new URL("/login", req.url);
            loginUrl.searchParams.set("next", req.nextUrl.pathname);
            return NextResponse.redirect(loginUrl);
        }
        const serviceClient = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            { auth: { autoRefreshToken: false, persistSession: false } }
        );
        const { data: adminRow } = await serviceClient
            .from("admin_users")
            .select("user_id")
            .eq("user_id", user.id)
            .maybeSingle();
        if (!adminRow) {
            return NextResponse.redirect(new URL("/", req.url));
        }
    }

    // Protect /orders — redirect unauthenticated users to /login
    if (req.nextUrl.pathname.startsWith("/orders") && !user) {
        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set("next", req.nextUrl.pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Redirect logged-in users away from /login and /register
    if ((req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/register") && user) {
        const next = req.nextUrl.searchParams.get("next") || "/orders";
        return NextResponse.redirect(new URL(next, req.url));
    }

    return res;
}

export const config = {
    matcher: ["/admin/:path*", "/orders/:path*", "/login", "/register"],
};
