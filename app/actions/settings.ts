'use server'

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

// --- ATUALIZAR PERFIL DO USUÁRIO ---
export async function updateUserProfile(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return { error: "Não autorizado" }

  const name = formData.get("name") as string
  const phone = formData.get("phone") as string

  // @ts-ignore
  const userId = session.user.id

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { name, phone }
    })
    revalidatePath("/dashboard/configuracoes/perfil")
    return { success: true, message: "Perfil atualizado com sucesso!" }
  } catch (error) {
    return { error: "Erro ao atualizar perfil." }
  }
}

// --- ATUALIZAR DADOS DA CLÍNICA (TENANT) ---
export async function updateTenantSettings(formData: FormData) {
  const session = await getServerSession(authOptions)
  // @ts-ignore
  if (!session?.user || session.user.role !== "OWNER") {
    return { error: "Apenas o dono pode editar dados da clínica." }
  }

  const name = formData.get("name") as string
  const primaryColor = formData.get("primaryColor") as string
  const address = formData.get("address") as string
  
  // @ts-ignore
  const tenantId = session.user.tenantId

  try {
    await prisma.tenant.update({
      where: { id: tenantId },
      data: { 
        name, 
        primaryColor,
        address 
      }
    })
    revalidatePath("/dashboard/configuracoes/clinica")
    return { success: true, message: "Dados da clínica atualizados!" }
  } catch (error) {
    return { error: "Erro ao atualizar clínica." }
  }
}

// --- GERENCIAR ASSINATURA (PORTAL STRIPE) ---
// Nota: Isso requer que a lib/stripe.ts esteja configurada. 
// Se der erro, verifique se a chave do Stripe está no .env
import { stripe } from "@/lib/stripe" 

export async function manageSubscription() {
  const session = await getServerSession(authOptions)
  // @ts-ignore
  if (!session?.user || session.user.role !== "OWNER") {
    return redirect("/dashboard")
  }

  // @ts-ignore
  const tenantId = session.user.tenantId

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId }
  })

  if (!tenant?.stripeCustomerId) {
    // Se não tem customer ID, talvez redirecionar para checkout ou avisar
    throw new Error("Cliente não encontrado no Stripe")
  }

  // Cria sessão do portal de cobrança
  const portalSession = await stripe.billingPortal.sessions.create({
    customer: tenant.stripeCustomerId,
    return_url: `${process.env.NEXTAUTH_URL}/dashboard/configuracoes/assinatura`,
  })

  redirect(portalSession.url)
}