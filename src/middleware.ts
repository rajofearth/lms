import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define protected routes
const protectedRoutes = [
  "/dashboard",
  "/access",
  "/create", 
  "/settings",
  "/course-studio",
  "/profile",
  "/certificates",
  "/checkout",
  "/preview",
  "/course"
];

function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some(route => pathname.startsWith(route));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the route needs protection
  if (isProtectedRoute(pathname)) {
    // Check for session cookie (lightweight check)
    const sessionCookie = request.cookies.get("better-auth.session_token");
    
    if (!sessionCookie) {
      // Redirect to sign-in if no session
      return NextResponse.redirect(new URL("/auth/sign-in", request.url));
    }
  }
  
  // Allow public routes and authenticated users to continue
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
