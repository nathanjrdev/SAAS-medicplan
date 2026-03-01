import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { differenceInYears } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea" // Assumindo componente existente ou nativo
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area" // Se não tiver, use div com overflow
import { Separator } from "@/components/ui/separator" // Se não tiver, use hr
import { finishConsultation } from "@/app/actions/atendimento"

// Componente Cliente para o Formulário para melhor interatividade e feedback
import { ConsultationForm } from "./consultation-form" 

export default async function ConsultationPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/login")

  const appointment = await prisma.appointment.findUnique({
    where: { id: params.id },
    include: {
      patient: {
        include: {
          records: {
            orderBy: { createdAt: 'desc' },
            take: 10
          }
        }
      },
      service: true
    }
  })

  if (!appointment) {
    return <div className="p-8">Agendamento não encontrado.</div>
  }

  const patient = appointment.patient
  const age = patient.birthDate 
    ? differenceInYears(new Date(), new Date(patient.birthDate)) 
    : "N/A"

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-gray-50">
      {/* LATERAL ESQUERDA - Resumo e Histórico */}
      <aside className="w-1/3 max-w-md border-r bg-white flex flex-col">
        {/* Card do Paciente */}
        <div className="p-6 border-b bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800">{patient.name}</h2>
          <div className="text-sm text-slate-500 mt-1">
            <p>{age} anos • {patient.phone}</p>
            {patient.cpf && <p>CPF: {patient.cpf}</p>}
          </div>
          
          {/* Dados Vitais (Placeholder) */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="bg-white p-3 rounded border text-center">
              <span className="block text-xs text-gray-400 uppercase">Peso</span>
              <span className="font-semibold text-gray-700">-- kg</span>
            </div>
            <div className="bg-white p-3 rounded border text-center">
              <span className="block text-xs text-gray-400 uppercase">Altura</span>
              <span className="font-semibold text-gray-700">-- m</span>
            </div>
          </div>
        </div>

        {/* Timeline de Histórico */}
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="font-semibold text-sm text-slate-700 mb-4 uppercase tracking-wider">Histórico Clínico</h3>
          
          <div className="space-y-6">
            {patient.records.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Nenhum registro anterior.</p>
            ) : (
              patient.records.map((record) => (
                <div key={record.id} className="relative pl-6 border-l-2 border-slate-200">
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-300 ring-4 ring-white" />
                  <div className="mb-1">
                    <span className="text-xs font-medium text-slate-500">
                      {new Date(record.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div className="bg-white p-3 rounded-lg border shadow-sm text-sm text-slate-600 line-clamp-4">
                    {record.description}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </aside>

      {/* CENTRO/DIREITA - Área de Trabalho Ativa */}
      <main className="flex-1 flex flex-col h-full">
        <header className="h-16 border-b bg-white flex items-center justify-between px-6">
          <div>
            <h1 className="text-lg font-semibold text-slate-800">Atendimento em Andamento</h1>
            <p className="text-xs text-slate-500">Serviço: {appointment.service?.name || "Consulta Geral"}</p>
          </div>
          <div className="text-right">
             <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
               Em atendimento
             </span>
          </div>
        </header>

        {/* Formulário Interativo */}
        <div className="flex-1 overflow-y-auto p-6">
           <ConsultationForm 
             appointmentId={appointment.id} 
             patientId={patient.id} 
           />
        </div>
      </main>
    </div>
  )
}