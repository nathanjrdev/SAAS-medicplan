'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

// Helper para pegar a sessão e garantir segurança
async function getSessionUser() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error("Usuário não autenticado")
  }
  return session.user as { id: string; tenantId: string; email: string }
}

export async function createPatient(formData: FormData) {
  const user = await getSessionUser() // Pega o usuário logado

  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const cpf = formData.get("cpf") as string
  const phone = formData.get("phone") as string
  const birthDate = formData.get("birthDate") as string

  if (!name || !cpf || !phone) return

  await prisma.patient.create({
    data: {
      name,
      email,
      cpf,
      phone,
      birthDate: birthDate ? new Date(birthDate) : null,
      tenantId: user.tenantId, // <--- VINCULA AO TENANT ATUAL
    },
  })

  revalidatePath("/dashboard/pacientes")
  redirect("/dashboard/pacientes")
}

export async function getPatients(query: string = "") {
  const session = await getServerSession(authOptions)
  
  // Se não estiver logado, retorna array vazio por segurança
  if (!session?.user) return []
  
  // @ts-ignore
  const tenantId = session.user.tenantId

  const whereCondition = {
    tenantId: tenantId, // <--- FILTRO DE SEGURANÇA OBRIGATÓRIO
    ...(query && {
        OR: [
            { name: { contains: query, mode: 'insensitive' as const } },
            { cpf: { contains: query } }
        ]
    })
  }

  return await prisma.patient.findMany({
    where: whereCondition,
    orderBy: { createdAt: 'desc' },
    take: 20
  })
}

export async function deletePatient(formData: FormData) {
  const user = await getSessionUser()
  const id = formData.get("id") as string
  
  if (!id) return;

  try {
    // Garante que só deleta se o paciente pertencer à mesma clínica
    await prisma.patient.delete({
      where: { 
        id,
        tenantId: user.tenantId 
      }
    })
    revalidatePath("/dashboard/pacientes")
  } catch (error) {
    console.error("Erro ao excluir", error)
  }
}