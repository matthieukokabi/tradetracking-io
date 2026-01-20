import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// Set to true to enable maintenance/coming soon mode
const MAINTENANCE_MODE = process.env.MAINTENANCE_MODE === "true";

// Pages that are always accessible (even in maintenance mode)
const PUBLIC_PATHS = ["/coming-soon", "/admin-access", "/api", "/_next", "/favicon"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always allow public paths
  if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Check for maintenance mode
  if (MAINTENANCE_MODE) {
    // Check for admin access cookie
    const adminAccess = req.cookies.get("admin_access");

    if (!adminAccess || adminAccess.value !== "true") {
      // Redirect non-admin users to coming soon page
      return NextResponse.redirect(new URL("/coming-soon", req.url));
    }
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-dev" });

  // Protect dashboard routes
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/journal") || pathname.startsWith("/reports") || pathname.startsWith("/settings")) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
  }

  // Redirect to dashboard if logged in and trying to access auth pages
  if (token && (pathname.startsWith("/auth/login") || pathname.startsWith("/auth/register"))) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
