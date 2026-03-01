import { Metadata } from "next"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AgendaCalendar } from "./agenda-calendar" // Verifique se este componente existe, senão remova
import Link from "next/link"
import { getAppointments } from "@/app/actions/agenda"

export const metadata: Metadata = {
  title: "Agenda",
  description: "Gerencie suas consultas",
}

// CORREÇÃO AQUI: searchParams é uma Promise agora
export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; date?: string }>
}) {
  // 1. Aguardamos os parâmetros antes de usar
  const params = await searchParams;
  const filter = params.filter || "today";
  const dateParam = params.date;

  // 2. Buscamos os agendamentos (supondo que sua action aceite esses filtros)
  const appointments = await getAppointments(filter, dateParam);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Agenda</h2>
        <div className="flex items-center space-x-2">
          <Link href="/dashboard/agenda/novo">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Nova Consulta
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 lg:col-span-5">
          <CardHeader>
            <CardTitle>Visão Geral</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            {/* Se você tiver o componente de calendário, use aqui. 
                Caso contrário, liste os agendamentos de forma simples: */}
            <div className="space-y-4">
              {appointments && appointments.length > 0 ? (
                appointments.map((apt: any) => (
                  <div key={apt.id} className="flex items-center justify-between border-b p-4">
                    <div>
                      <p className="font-medium">{apt.patient.name}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(apt.date).toLocaleString('pt-BR')} - {apt.service?.name || "Consulta"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        apt.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' : 
                        apt.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100'
                      }`}>
                        {apt.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground p-4">Nenhum agendamento para este filtro.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}