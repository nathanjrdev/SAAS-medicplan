'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { parseISO, isValid, startOfDay, endOfDay } from "date-fns"

// --- LISTAR AGENDAMENTOS ---
export async function getAppointments(filterMode: string = "today") {
  const session = await getServerSession(authOptions)
  if (!session?.user) return []

  // @ts-ignore
  const tenantId = session.user.tenantId

  const where: any = { tenantId }
  const hoje = new Date();

  if (filterMode === 'today') {
    where.date = {
      gte: startOfDay(hoje),
      lte: endOfDay(hoje)
    }
  } else if (filterMode === 'upcoming') {
    where.date = {
      gte: hoje
    }
  } 

  const appointments = await prisma.appointment.findMany({
    where,
    include: {
      patient: true,
      service: true
    },
    orderBy: { date: 'asc' }
  })

  return appointments.map(app => ({
    ...app,
    price: app.price.toNumber(),
    date: app.date.toISOString(),
    createdAt: app.createdAt.toISOString(),
    updatedAt: app.updatedAt.toISOString()
  }))
}

// --- CRIAR AGENDAMENTO ---
export async function createAppointment(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return { success: false, error: "Não autorizado" }

  // @ts-ignore
  const tenantId = session.user.tenantId
  // @ts-ignore
  const userId = session.user.id

  const patientId = formData.get("patientId") as string
  const dateIso = formData.get("date") as string
  const serviceId = formData.get("serviceId") as string
  const notes = formData.get("notes") as string
  const manualPrice = formData.get("price") 

  if (!patientId || !dateIso) {
    return { success: false, error: "Dados inválidos" }
  }

  const date = parseISO(dateIso)
  if (!isValid(date)) return { success: false, error: "Data inválida" }

  try {
    // VALIDAÇÃO DE CONFLITO: Verifica se o médico já tem agendamento neste horário
    // Ignora agendamentos cancelados
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        doctorId: userId,
        date: date,
        status: {
          not: 'CANCELLED'
        }
      }
    })

    if (existingAppointment) {
      return { success: false, error: "Horário indisponível. Já existe um agendamento neste horário." }
    }

    // Busca preço
    let price = 0
    if (manualPrice) {
      price = parseFloat(manualPrice.toString())
    } else if (serviceId) {
      const service = await prisma.service.findUnique({ where: { id: serviceId } })
      if (service) price = Number(service.price)
    }

    await prisma.appointment.create({
      data: {
        date,
        patientId,
        doctorId: userId,
        tenantId,
        serviceId: serviceId || null,
        notes: notes || "",
        status: "CONFIRMED",
        price: price
      }
    })

    revalidatePath("/dashboard/agenda")
    revalidatePath("/dashboard/financeiro") 
    return { success: true }

  } catch (error) {
    console.error(error)
    return { success: false, error: "Erro ao criar agendamento" }
  }
}

// --- ATUALIZAR STATUS ---
export async function updateAppointmentStatus(id: string, newStatus: string) {
    try {
        await prisma.appointment.update({
            where: { id },
            data: { 
                // @ts-ignore
                status: newStatus 
            }
        })
        revalidatePath("/dashboard/agenda")
        return { success: true }
    } catch (error) {
        return { success: false, error: "Erro ao atualizar status" }
    }
}

// --- ATUALIZAR DADOS ---
export async function updateAppointment(id: string, data: { 
    price?: number, 
    serviceId?: string, 
    notes?: string,
    status?: string 
}) {
    try {
        await prisma.appointment.update({
            where: { id },
            data: {
                price: data.price,       
                serviceId: data.serviceId, 
                notes: data.notes,
                // @ts-ignore
                status: data.status
            }
        })

        revalidatePath("/dashboard/agenda")
        revalidatePath("/dashboard/financeiro") 
        return { success: true }
    } catch (error) {
        console.error("Erro ao atualizar agendamento:", error)
        return { success: false, error: "Erro ao atualizar" }
    }
}

// --- EXCLUIR ---
export async function deleteAppointment(formData: FormData) {
    const id = formData.get("id") as string
    try {
        await prisma.appointment.delete({ where: { id } })
        revalidatePath("/dashboard/agenda")
        revalidatePath("/dashboard/financeiro")
        return { success: true }
    } catch (error) {
        return { success: false, error: "Erro ao excluir" }
    }
}