// Proxy (Next.js 16+ equivalent of middleware) for auth protection
import { auth } from "./lib/auth"

export default auth((req) => {
  const { pathname } = req.nextUrl

  // Public paths
  const publicPaths = ["/login", "/api/auth", "/api/license/validate", "/api/license/status", "/docs"]
  const isPublic = publicPaths.some((p) => pathname.startsWith(p))

  // Static assets
  if (pathname.startsWith("/_next") || pathname.startsWith("/images") || pathname === "/favicon.ico") {
    return
  }

  // Redirect root to dashboard
  if (pathname === "/") {
    return Response.redirect(new URL("/dashboard", req.nextUrl))
  }

  if (!req.auth && !isPublic) {
    return Response.redirect(new URL("/login", req.nextUrl))
  }

  if (req.auth && pathname === "/login") {
    return Response.redirect(new URL("/dashboard", req.nextUrl))
  }
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
