import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const role = req.nextauth.token?.role as string;

    // Rutas protegidas por rol
    if (pathname.startsWith("/super-admin") && role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    if (pathname.startsWith("/club") && !["SUPER_ADMIN", "CLUB_ADMIN", "ENTRENADOR"].includes(role)) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    if (pathname.startsWith("/app") && !["JUGADOR", "TUTOR", "ENTRENADOR", "CLUB_ADMIN", "SUPER_ADMIN"].includes(role)) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ req, token }) {
        if (!token) return false;
        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/super-admin/:path*", "/club/:path*", "/app/:path*", "/api/protected/:path*"],
};
