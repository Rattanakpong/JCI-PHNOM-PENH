import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Match every route except Next internals, admin API/auth routes, and static assets.
  matcher: ["/((?!api|admin|_next|_vercel|.*\\..*).*)"],
};
