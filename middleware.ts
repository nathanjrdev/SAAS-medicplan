import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { canAccessRoute } from "@/lib/permissions";
import { UserRole } from "@prisma/client";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    
    // Se não tiver token, o withAuth já redireciona para login, 
    // mas garantimos a tipagem aqui.
    if (!token) return NextResponse.redirect(new URL("/login", req.url));

    const role = token.role as UserRole;
    const path = req.nextUrl.pathname;

    // Validação de RBAC baseada em rotas
    if (!canAccessRoute(role, path)) {
      // Se tentar acessar área restrita, redireciona para a raiz do dashboard
      // Onde ele verá a tela permitida para o cargo dele
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  // Protege todas as rotas de dashboard
  matcher: ["/dashboard/:path*"],
};