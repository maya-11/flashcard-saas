import { clerkMiddleware } from "@clerk/nextjs/server";

// Define public routes that don't require authentication
const publicRoutes = ["/", "/sign-in", "/sign-up"];

export default clerkMiddleware({
  publicRoutes,
  afterAuth: (auth, req, evt) => {
    // Redirect to sign-in page if user is not authenticated and tries to access protected routes
    if (!auth.userId && !publicRoutes.includes(req.nextUrl.pathname)) {
      return new Response(null, {
        status: 302,
        headers: { Location: "/sign-in" },
      });
    }
  },
});

// Matcher config to handle API routes and Next.js internals
export const config = {
  matcher: [
    "/((?!_next|static|favicon.ico|.*\\..*).*)", // Match all routes except static files
    "/api/(.*)", // Always match API routes
  ],
};
