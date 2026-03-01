import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { manageSubscription } from "@/app/actions/settings"
import Link from "next/link"
import { ArrowLeft, CreditCard, CheckCircle, AlertTriangle } from "lucide-react"

export default async function SubscriptionPage() {
  const session = await getServerSession(authOptions)
  // @ts-ignore
  if (!session?.user || session.user.role !== "OWNER") {
    return redirect("/dashboard/configuracoes")
  }

  // @ts-ignore
  const tenant = await prisma.tenant.findUnique({ where: { id: session.user.tenantId } })
  if (!tenant) return null

  const isPro = tenant.plan === "PRO" || tenant.plan === "ACTIVE" // Ajuste conforme sua lógica de planos
  const isActive = tenant.stripeSubscriptionId ? true : false

  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/dashboard/configuracoes">
           <Button variant="outline" size="icon"><ArrowLeft size={18}/></Button>
        </Link>
        <h1 className="text-2xl font-bold">Assinatura</h1>
      </div>

      <div className="grid gap-6">
        {/* Status Card */}
        <Card className="border-l-4 border-l-blue-600">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-xl">Plano Atual: {tenant.plan}</CardTitle>
                        <CardDescription>Gerencie seus pagamentos e faturas.</CardDescription>
                    </div>
                    <Badge variant={isActive ? "default" : "destructive"} className="text-base px-4 py-1">
                        {isActive ? "Ativo" : "Inativo / Grátis"}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    {isActive ? (
                        <CheckCircle className="text-green-500 h-5 w-5" />
                    ) : (
                        <AlertTriangle className="text-yellow-500 h-5 w-5" />
                    )}
                    <span>
                        {isActive 
                         ? "Sua assinatura está em dia. Todos os recursos estão liberados." 
                         : "Você está usando a versão gratuita ou trial."}
                    </span>
                </div>
                
                {tenant.stripeCurrentPeriodEnd && (
                    <p className="text-sm font-medium">
                        Renovação automática em: {tenant.stripeCurrentPeriodEnd.toLocaleDateString('pt-BR')}
                    </p>
                )}
            </CardContent>
        </Card>

        {/* Action Card */}
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" /> Portal do Assinante
                </CardTitle>
                <CardDescription>
                    Acesse o portal seguro da Stripe para:
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm">
                    <li>Alterar forma de pagamento (Cartão de Crédito)</li>
                    <li>Baixar faturas e recibos</li>
                    <li>Fazer upgrade ou downgrade de plano</li>
                    <li>Cancelar assinatura</li>
                </ul>
            </CardContent>
            <CardFooter className="bg-muted/30 border-t px-6 py-4">
                <form action={manageSubscription} className="w-full">
                    <Button type="submit" className="w-full sm:w-auto" disabled={!tenant.stripeCustomerId}>
                        {tenant.stripeCustomerId ? "Gerenciar Assinatura no Stripe" : "Contatar Suporte para Assinar"}
                    </Button>
                    {!tenant.stripeCustomerId && (
                        <p className="text-xs text-center mt-2 text-muted-foreground">
                            Erro: ID do cliente Stripe não encontrado. Entre em contato com o administrador.
                        </p>
                    )}
                </form>
            </CardFooter>
        </Card>
      </div>
    </div>
  )
}