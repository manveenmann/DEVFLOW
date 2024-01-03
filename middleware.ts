import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: [
    "/",
    "/question/(.*)",
    "/tags",
    "/tags/(.*)",
    "/profile/(.*)",
    "/community",
    "/jobs",
    "/api/webhooks(.*)",
  ],
  ignoredRoutes: ["/api/*"],
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
