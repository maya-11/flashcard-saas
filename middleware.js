import { clerkMiddleware } from '@clerk/nextjs/server';

const publicRoutes = ['/', '/sign-in', '/sign-up'];

export default clerkMiddleware({
  publicRoutes,
  ignoredRoutes: ['/((?!api|trpc))(_next.*|.+\\.[\\w]+$)', '/sign-in/SignIn_clerk_catchall_check_1723867424031'],
  afterAuth: (auth, req, evt) => {
    // Custom behavior after authentication
    if (!auth.userId && !publicRoutes.includes(req.nextUrl.pathname)) {
      return new Response(null, { status: 302, headers: { Location: '/sign-in' } });
    }
  },
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};