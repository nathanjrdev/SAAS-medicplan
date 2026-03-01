import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// Segredo simples para evitar requisições indevidas (coloque no .env em produção)
const WEBHOOK_SECRET = "minha-chave-secreta-webhook"

export async function POST(req: Request) {
  try {
    // 1. Validação de Segurança (Simples)
    const url = new URL(req.url)
    const token = url.searchParams.get("token")

    if (token !== WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 2. Recebe o Payload (Simulando formato padrão de APIs)
    const body = await req.json()
    const { phone, message } = body

    // Normaliza o texto para pegar intenção de confirmação
    const text = message?.toLowerCase() || ""
    const isConfirmation = ["sim", "confirmar", "1", "ok"].some(word => text.includes(word))

    if (!isConfirmation) {
      return NextResponse.json({ message: "Mensagem recebida, mas não é uma confirmação." })
    }

    // 3. Busca o agendamento PENDENTE mais próximo deste paciente
    // Obs: Removemos caracteres não numéricos do telefone para buscar
    const cleanPhone = phone.replace(/\D/g, "")

    const appointment = await prisma.appointment.findFirst({
      where: {
        status: "PENDING",
        date: { gte: new Date() }, // Apenas consultas futuras
        patient: {
          phone: { contains: cleanPhone } // Busca flexível pelo telefone
        }
      },
      orderBy: { date: 'asc' }, // Pega a mais próxima
      include: { patient: true }
    })

    if (!appointment) {
      return NextResponse.json({ error: "Nenhum agendamento pendente encontrado para este telefone." }, { status: 404 })
    }

    // 4. Atualiza para CONFIRMED
    await prisma.appointment.update({
      where: { id: appointment.id },
      data: { status: "CONFIRMED" }
    })

    return NextResponse.json({ 
      success: true, 
      message: `Consulta de ${appointment.patient.name} confirmada com sucesso!`,
      appointmentId: appointment.id
    })

  } catch (error) {
    console.error("Erro no Webhook:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}