import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { updateUserProfile } from "@/app/actions/settings"
import Link from "next/link"
import { ArrowLeft, Save } from "lucide-react"

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")

  // @ts-ignore
  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user) return null

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/dashboard/configuracoes">
           <Button variant="outline" size="icon"><ArrowLeft size={18}/></Button>
        </Link>
        <h1 className="text-2xl font-bold">Minha Conta</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações Pessoais</CardTitle>
          <CardDescription>Atualize seus dados de identificação.</CardDescription>
        </CardHeader>
        <form action={updateUserProfile}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input id="name" name="name" defaultValue={user.name} required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" value={user.email} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground">O e-mail não pode ser alterado.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone / Celular</Label>
              <Input id="phone" name="phone" defaultValue={user.phone || ""} placeholder="(00) 00000-0000" />
            </div>
            
            <div className="space-y-2">
                <Label>Cargo</Label>
                <div className="p-2 border rounded-md bg-muted text-sm font-medium">
                    {user.role === 'OWNER' ? 'Administrador / Dono' : user.role === 'DOCTOR' ? 'Médico' : 'Secretária'}
                </div>
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button type="submit" className="ml-auto gap-2">
              <Save size={16} /> Salvar Alterações
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}