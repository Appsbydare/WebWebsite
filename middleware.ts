import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

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

    // Protect /orders — redirect unauthenticated users to /login
    if (req.nextUrl.pathname.startsWith("/orders") && !user) {
        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set("next", req.nextUrl.pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Redirect logged-in users away from /login and /register
    if ((req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/register") && user) {
        return NextResponse.redirect(new URL("/orders", req.url));
    }

    return res;
}

export const config = {
    matcher: ["/orders/:path*", "/login", "/register"],
};
