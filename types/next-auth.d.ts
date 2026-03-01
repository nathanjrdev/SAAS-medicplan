import NextAuth, { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  /**
   * O objeto retornado no hook useSession(), getServerSession(), etc.
   */
  interface Session {
    user: {
      id: string
      tenantId: string
      role: string // <--- ADICIONADO
    } & DefaultSession["user"]
  }

  /**
   * O objeto User retornado do provider 'authorize'
   */
  interface User {
    id: string
    tenantId: string
    role: string // <--- ADICIONADO
  }
}

declare module "next-auth/jwt" {
  /**
   * O token JWT que o NextAuth salva criptografado
   */
  interface JWT {
    id: string
    tenantId: string
    role: string // <--- ADICIONADO
  }
}