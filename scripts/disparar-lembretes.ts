// scripts/disparar-lembretes.ts
import { PrismaClient } from '@prisma/client'
import { startOfDay, endOfDay, addDays, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const prisma = new PrismaClient()

async function main() {
  console.log('🤖 Iniciando robô de lembretes...')

  // 1. Define o intervalo "Amanhã"
  const tomorrow = addDays(new Date(), 1)
  const start = startOfDay(tomorrow)
  const end = endOfDay(tomorrow)

  console.log(`📅 Buscando consultas para: ${format(start, 'dd/MM/yyyy')}`)

  // 2. Busca consultas de AMANHÃ que estão PENDENTES
  const appointments = await prisma.appointment.findMany({
    where: {
      date: { gte: start, lte: end },
      status: "PENDING"
    },
    include: {
      patient: true,
      tenant: true // Precisamos dos dados da clínica para assinar a mensagem
    }
  })

  console.log(`🔎 Encontrados ${appointments.length} agendamentos pendentes.`)

  // 3. Processa e Gera a Fila
  for (const appt of appointments) {
    // Monta a mensagem personalizada
    const hora = format(appt.date, "HH:mm")
    const mensagem = `Olá ${appt.patient.name}, aqui é da ${appt.tenant.name}. Confirmamos sua consulta para amanhã às ${hora}? Responda SIM para confirmar.`

    // Evita duplicidade (Verifica se já criou log hoje para esse agendamento)
    const exists = await prisma.notificationLog.findFirst({
        where: { appointmentId: appt.id }
    })

    if (exists) {
        console.log(`⏭️ Ignorando ${appt.patient.name} (Já enfileirado)`)
        continue
    }

    // Cria o Log (Simulação do Envio)
    await prisma.notificationLog.create({
      data: {
        tenantId: appt.tenantId,
        appointmentId: appt.id,
        recipient: appt.patient.phone,
        content: mensagem,
        status: "SENT", // Na integração real, seria "PENDING" até o webhook confirmar envio
        type: "WHATSAPP"
      }
    })

    console.log(`✅ Mensagem enviada para ${appt.patient.name} (${appt.patient.phone})`)
    
    // Aqui entraria a chamada real: await axios.post(Z_API_URL, { phone, message: mensagem })
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })