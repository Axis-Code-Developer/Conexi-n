import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
    const isLoggedIn = !!req.auth;
    const isOnDashboard = ["/calendar", "/team", "/activities", "/resources"].some(path =>
        req.nextUrl.pathname.startsWith(path)
    );
    const isSetupPage = req.nextUrl.pathname.startsWith("/setup-admin");
    const isLoginPage = req.nextUrl.pathname.startsWith("/login");

    // Allow setup page access if not logged in (logic to block setup if users exist is in the route itself)
    if (isSetupPage) return;

    if (isOnDashboard) {
        if (isLoggedIn) return;
        return NextResponse.redirect(new URL("/login", req.nextUrl));
    } else if (isLoggedIn && isLoginPage) {
        return NextResponse.redirect(new URL("/calendar", req.nextUrl));
    }
});

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
