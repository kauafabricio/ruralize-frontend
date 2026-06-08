import { NextResponse, type NextRequest } from "next/server";

const AUTH_COOKIE_NAME = "ruralize_auth";

const privateRoutes = ["/feed", "/perfil", "/agendamentos", "/pontos"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSessionCookie = request.cookies.get(AUTH_COOKIE_NAME)?.value === "1";
  const isPrivateRoute = privateRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  if (isPrivateRoute && !hasSessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === "/login" && hasSessionCookie) {
    return NextResponse.redirect(new URL("/feed", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/feed/:path*",
    "/perfil/:path*",
    "/agendamentos/:path*",
    "/pontos/:path*",
    "/login",
  ],
};
