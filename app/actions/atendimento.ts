'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function finishConsultation(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return { success: false, error: "Não autorizado" }

  const appointmentId = formData.get("appointmentId") as string
  const patientId = formData.get("patientId") as string
  const anamnesis = formData.get("anamnesis") as string
  const prescription = formData.get("prescription") as string
  
  // @ts-ignore
  const doctorId = session.user.id
  // @ts-ignore
  const tenantId = session.user.tenantId

  if (!appointmentId || !patientId || !anamnesis) {
    return { success: false, error: "Dados obrigatórios faltando" }
  }

  try {
    // Uso de Transaction para garantir integridade
    await prisma.$transaction(async (tx) => {
      // 1. Criar o Prontuário (MedicalRecord)
      await tx.medicalRecord.create({
        data: {
          description: anamnesis,
          prescription: prescription || "",
          patientId: patientId,
          doctorId: doctorId,
          // Se o schema suportar anexo direto aqui no futuro, adicione.
        }
      })

      // 2. Atualizar o Appointment para COMPLETED
      // E verificar lógica financeira
      const appointment = await tx.appointment.findUnique({
        where: { id: appointmentId }
      })

      if (!appointment) throw new Error("Agendamento não encontrado")

      const updateData: any = {
        status: "COMPLETED"
      }

      // 3. Integração Financeira
      // Se ainda não foi pago, garante que o preço está correto e mantém PENDING
      // O módulo financeiro (getFinancialMetrics) já lê Appointments automaticamente como Receita (Income).
      // Se quisermos "forçar" um status financeiro ou gerar log, fazemos aqui.
      // Neste caso, vamos apenas garantir que, se não estava pago, continua PENDING para ser cobrado na recepção,
      // mas o fato de estar COMPLETED confirma a realização do serviço (receita devida).
      
      // Se não tiver preço definido (ex: 0), poderiamos definir um default, mas vamos respeitar o cadastro.
      
      await tx.appointment.update({
        where: { id: appointmentId },
        data: updateData
      })
    })

    revalidatePath("/dashboard/agenda")
    revalidatePath(`/dashboard/pacientes/${patientId}`)
    
    return { success: true }

  } catch (error) {
    console.error("Erro ao finalizar atendimento:", error)
    return { success: false, error: "Erro ao processar finalização" }
  }
}