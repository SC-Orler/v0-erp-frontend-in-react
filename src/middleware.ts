import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rutas públicas
  if (pathname === "/login") {
    return NextResponse.next()
  }

  // Verificar autenticación (en producción verificar token)
  const authStorage = request.cookies.get("auth-storage")

  if (!authStorage && pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public).*)"],
}
