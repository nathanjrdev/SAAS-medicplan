import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import Link from "next/link"
import { 
  ShieldCheck, 
  UserCog, 
  Building, 
  CreditCard 
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect("/login")
  }

  // Agora role estará preenchido!
  // @ts-ignore
  const userRole = session.user.role

  const settingsOptions = [
    {
      title: "Minha Conta",
      description: "Gerencie seus dados pessoais e senha.",
      href: "/dashboard/configuracoes/perfil", // (Futuro)
      icon: UserCog,
      allowedRoles: ["OWNER", "DOCTOR", "SECRETARY"]
    },
    {
      title: "Dados da Clínica",
      description: "Logo, cores e informações do estabelecimento.",
      href: "/dashboard/configuracoes/clinica", // (Futuro)
      icon: Building,
      allowedRoles: ["OWNER"]
    },
    {
      title: "Assinatura e Planos",
      description: "Gerencie sua assinatura do SaaS.",
      href: "/dashboard/configuracoes/assinatura", // (Futuro)
      icon: CreditCard,
      allowedRoles: ["OWNER"]
    },
    {
      title: "Auditoria e Segurança",
      description: "Logs de acesso e modificação de dados (LGPD).",
      href: "/dashboard/configuracoes/auditoria",
      icon: ShieldCheck,
      allowedRoles: ["OWNER"]
    }
  ]

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie as preferências da sua conta e da clínica.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {settingsOptions.map((option) => {
          // Se o role do usuário não estiver na lista permitida, não mostra o card
          if (!option.allowedRoles.includes(userRole)) return null

          return (
            <Link key={option.title} href={option.href}>
              <Card className="h-full hover:bg-muted/50 transition-colors cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {option.title}
                  </CardTitle>
                  <option.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <CardDescription>{option.description}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}