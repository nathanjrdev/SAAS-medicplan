import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { updateTenantSettings } from "@/app/actions/settings"
import Link from "next/link"
import { ArrowLeft, Store, Save } from "lucide-react"

export default async function ClinicSettingsPage() {
  const session = await getServerSession(authOptions)
  // @ts-ignore
  if (!session?.user || session.user.role !== "OWNER") {
    return redirect("/dashboard/configuracoes")
  }

  // @ts-ignore
  const tenant = await prisma.tenant.findUnique({ where: { id: session.user.tenantId } })
  if (!tenant) return null

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/dashboard/configuracoes">
           <Button variant="outline" size="icon"><ArrowLeft size={18}/></Button>
        </Link>
        <h1 className="text-2xl font-bold">Dados da Clínica</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" /> Identidade da Clínica
          </CardTitle>
          <CardDescription>Informações exibidas para seus pacientes e nos relatórios.</CardDescription>
        </CardHeader>
        <form action={updateTenantSettings}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                <Label htmlFor="name">Nome da Clínica</Label>
                <Input id="name" name="name" defaultValue={tenant.name} required />
                </div>
                <div className="space-y-2">
                <Label htmlFor="slug">Link Personalizado (Slug)</Label>
                <Input id="slug" value={tenant.slug} disabled className="bg-muted" />
                </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Endereço Completo</Label>
              <Input id="address" name="address" defaultValue={tenant.address || ""} placeholder="Rua, Número, Bairro, Cidade - UF" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="primaryColor">Cor Principal (Tema)</Label>
              <div className="flex items-center gap-2">
                <Input 
                    id="primaryColor" 
                    name="primaryColor" 
                    type="color" 
                    defaultValue={tenant.primaryColor || "#000000"} 
                    className="w-16 h-10 p-1 cursor-pointer"
                />
                <span className="text-sm text-muted-foreground">Escolha a cor usada nos botões e destaques.</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button type="submit" className="ml-auto gap-2">
              <Save size={16} /> Salvar Configurações
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}