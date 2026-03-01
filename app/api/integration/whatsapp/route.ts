import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { parseISO, isValid, addMinutes, isBefore, setHours, setMinutes, getDay, format } from "date-fns"

const API_SECRET = "minha-senha-secreta-123"
const APPOINTMENT_DURATION = 30; // Duração padrão em minutos

// --- GET: Busca Informações (Endereço, Serviços, Meus Agendamentos) ---
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const secret = searchParams.get("secret")
  const tenantId = searchParams.get("tenantId")
  const action = searchParams.get("action") // 'address', 'services', 'my_appointments'
  const phone = searchParams.get("phone")

  // 1. Segurança
  if (secret !== API_SECRET) {
    return NextResponse.json({ error: "Senha incorreta" }, { status: 401 })
  }

  if (!tenantId) {
    return NextResponse.json({ error: "Tenant ID faltando" }, { status: 400 })
  }

  try {
    // A. BUSCAR ENDEREÇO
    if (action === 'address') {
        const tenant = await prisma.tenant.findUnique({
            where: { id: tenantId },
            select: { 
                name: true, 
                address: true,
                whatsappPhone: true 
            }
        })

        if (!tenant) return NextResponse.json({ error: "Clínica não encontrada" }, { status: 404 })
        
        return NextResponse.json({
            name: tenant.name,
            address: tenant.address || "Endereço não cadastrado no sistema.",
            phone: tenant.whatsappPhone
        })
    }

    // B. LISTAR SERVIÇOS
    if (action === 'services') {
        const services = await prisma.service.findMany({
            where: { 
                tenantId, 
                active: true 
            },
            select: {
                name: true,
                price: true,
                durationMin: true
            }
        })
        return NextResponse.json({ services })
    }

    // C. MEUS AGENDAMENTOS (Para consultar e cancelar)
    if (action === 'my_appointments' && phone) {
        const cleanPhone = phone.replace(/\D/g, "")
        
        // Acha o paciente pelo telefone
        const patient = await prisma.patient.findFirst({
            where: { phone: { contains: cleanPhone }, tenantId }
        })

        if (!patient) {
            return NextResponse.json({ appointments: [] })
        }

        // Busca agendamentos FUTUROS e PENDENTES/CONFIRMADOS
        const appointments = await prisma.appointment.findMany({
            where: {
                patientId: patient.id,
                tenantId,
                date: { gte: new Date() }, // Apenas futuros
                status: { in: ['PENDING', 'CONFIRMED'] }
            },
            include: {
                service: true,
                doctor: true
            },
            orderBy: { date: 'asc' }
        })

        // Formata para o Bot ler fácil
        const formatted = appointments.map(app => ({
            id: app.id,
            date: format(app.date, "dd/MM 'às' HH:mm"),
            serviceName: app.service?.name || "Consulta",
            doctorName: app.doctor.name
        }))

        return NextResponse.json({ appointments: formatted })
    }

    return NextResponse.json({ error: "Ação inválida" }, { status: 400 })

  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

// --- POST: Cria Agendamento OU Cancela ---
export async function POST(req: Request) {
  try {
    const body = await req.json()
    // Adicionamos 'action' e 'appointmentId' no body para suportar cancelamento
    const { secret, action, appointmentId, name, phone, cpf, dateIso, tenantId, serviceCategory } = body

    // 1. Segurança
    if (secret !== API_SECRET) {
      return NextResponse.json({ error: "Senha incorreta" }, { status: 401 })
    }

    // --- NOVA AÇÃO: CANCELAR ---
    if (action === 'CANCEL') {
        if (!appointmentId) {
            return NextResponse.json({ error: "ID do agendamento faltando" }, { status: 400 })
        }
        
        await prisma.appointment.update({
            where: { id: appointmentId },
            data: { status: 'CANCELLED' }
        })

        return NextResponse.json({ success: true, message: "Agendamento cancelado com sucesso." })
    }

    // --- AÇÃO PADRÃO: AGENDAR ---
    
    if (!tenantId || !phone || !dateIso) {
      return NextResponse.json({ error: "Dados faltando" }, { status: 400 })
    }

    // 2. Acha ou Cria Paciente
    const cleanPhone = phone.replace(/\D/g, "")
    let patient = await prisma.patient.findFirst({
      where: { phone: { contains: cleanPhone }, tenantId }
    })

    if (!patient) {
      patient = await prisma.patient.create({
        data: { name, phone: cleanPhone, tenantId }
      })
    }

    // 3. Validação de Data
    const appointmentDate = parseISO(dateIso)
    if (!isValid(appointmentDate)) {
      return NextResponse.json({ error: "Data inválida" }, { status: 400 })
    }

    if (isBefore(appointmentDate, new Date())) {
        return NextResponse.json({ error: "Data no passado" }, { status: 400 })
    }

    // 4. Acha Médico
    const doctor = await prisma.user.findFirst({
      where: { 
        tenantId,
        OR: [{ role: "DOCTOR" }, { role: "OWNER" }]
      },
      include: {
        availabilities: true
      }
    })

    if (!doctor) {
      return NextResponse.json({ error: "Sem médico disponível" }, { status: 404 })
    }

    // 5. Identifica Serviço e Preço
    let selectedService = null;
    let appointmentPrice = 0;

    if (serviceCategory) {
        // Palavras-chave para buscar
        const keyword = serviceCategory === 'RETORNO' ? 'Retorno' : 'Consulta';
        
        selectedService = await prisma.service.findFirst({
            where: {
                tenantId: tenantId,
                name: { contains: keyword, mode: 'insensitive' },
                active: true
            }
        });

        if (selectedService) {
            appointmentPrice = Number(selectedService.price);
        }
    }

    // 6. Lógica de Disponibilidade (Expediente + Conflitos)
    const isSlotAvailable = async (date: Date) => {
        let isWorkingHours = false;
        
        if (doctor.availabilities.length > 0) {
            const dayOfWeek = getDay(date); // 0 = Domingo, 1 = Segunda...
            const availability = doctor.availabilities.find(a => a.dayOfWeek === dayOfWeek);
            
            if (availability) {
                const [startHour, startMin] = availability.startTime.split(':').map(Number);
                const [endHour, endMin] = availability.endTime.split(':').map(Number);
                
                const startWork = setMinutes(setHours(date, startHour), startMin);
                const endWork = setMinutes(setHours(date, endHour), endMin);
                
                if (date >= startWork && date < endWork) {
                    isWorkingHours = true;
                }
            }
        } else {
            // Fallback: Seg a Sex, 09h as 18h
            const day = getDay(date);
            const hour = date.getHours();
            if (day >= 1 && day <= 5 && hour >= 9 && hour < 18) {
                isWorkingHours = true;
            }
        }

        if (!isWorkingHours) return "OUT_OF_HOURS";

        const conflict = await prisma.appointment.findFirst({
            where: {
                doctorId: doctor.id,
                date: date,
                status: { notIn: ["CANCELLED", "NO_SHOW"] }
            }
        });

        if (conflict) return "BUSY";

        return "AVAILABLE";
    };

    const availabilityStatus = await isSlotAvailable(appointmentDate);

    if (availabilityStatus !== "AVAILABLE") {
        // Gera sugestões
        const suggestions: string[] = [];
        let attemptDate = addMinutes(appointmentDate, APPOINTMENT_DURATION);
        let attempts = 0;

        while (suggestions.length < 3 && attempts < 50) { 
            const status = await isSlotAvailable(attemptDate);
            if (status === "AVAILABLE") {
                suggestions.push(format(attemptDate, "dd/MM/yyyy HH:mm"));
            }
            attemptDate = addMinutes(attemptDate, APPOINTMENT_DURATION);
            attempts++;
        }

        return NextResponse.json({ 
            error: availabilityStatus === "BUSY" ? "Horário ocupado" : "Fora do expediente", 
            suggestions,
            status: 409
        }, { status: 409 });
    }

    // 7. Cria Agendamento
    const appointment = await prisma.appointment.create({
      data: {
        date: appointmentDate,
        status: "CONFIRMED",
        notes: "Agendado via WhatsApp Bot",
        patientId: patient.id,
        doctorId: doctor.id,
        tenantId,
        serviceId: selectedService?.id || null, 
        price: appointmentPrice 
      }
    })

    return NextResponse.json({ 
      success: true, 
      id: appointment.id, 
      doctor: doctor.name,
      serviceName: selectedService?.name || "Consulta Padrão",
      price: appointmentPrice 
    })

  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}