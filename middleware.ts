import createMiddleware from "next-intl/middleware";
import { routing } from "@/app/lib/i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api|.*\\.png|.*\\.svg|.*\\.jpeg|.*\\.jpg|.*\\.webp).*)",
    "/",
    "/(ko|en):path*",
  ],
};
