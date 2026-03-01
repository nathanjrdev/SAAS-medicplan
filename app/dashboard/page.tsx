import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay } from "date-fns"; 
import { Users, Calendar, Activity, DollarSign, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserRole } from "@prisma/client";

// ---------------------------------------------------------
// COMPONENTE: Dashboard da Secretária
// ---------------------------------------------------------
async function SecretaryDashboard() {
  const hojeInicio = startOfDay(new Date());
  const hojeFim = endOfDay(new Date());

  const agendamentosHoje = await prisma.appointment.findMany({
    where: {
      date: { gte: hojeInicio, lte: hojeFim },
      status: { not: "CANCELLED" }
    },
    include: { patient: true, doctor: true, service: true },
    orderBy: { date: 'asc' }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <h2 className="text-2xl font-bold">Agenda do Dia</h2>
         <Link href="/dashboard/agenda/novo">
            <Button>+ Novo Agendamento</Button>
         </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
         <div className="bg-white p-6 rounded-xl border shadow-sm">
            <div className="text-sm text-gray-500">Total Hoje</div>
            <div className="text-3xl font-bold">{agendamentosHoje.length}</div>
         </div>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-gray-50 font-medium">Próximos Horários</div>
        <div className="divide-y">
          {agendamentosHoje.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Nenhum agendamento para hoje.</div>
          ) : (
            agendamentosHoje.map(app => (
              <div key={app.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 text-primary p-2 rounded-lg font-bold">
                    {app.date.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                  </div>
                  <div>
                    <div className="font-semibold">{app.patient.name}</div>
                    <div className="text-sm text-gray-500">Dr(a). {app.doctor.name} - {app.service?.name}</div>
                  </div>
                </div>
                <div className="text-sm px-2 py-1 bg-gray-100 rounded">
                  {app.status}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------
// COMPONENTE: Dashboard do Médico
// ---------------------------------------------------------
async function DoctorDashboard({ userId }: { userId: string }) {
  const hojeInicio = startOfDay(new Date());

  const proximoPaciente = await prisma.appointment.findFirst({
    where: {
      doctorId: userId,
      date: { gte: new Date() },
      status: { not: "CANCELLED" }
    },
    orderBy: { date: 'asc' },
    include: { patient: true }
  });

  const meusPacientesCount = await prisma.appointment.groupBy({
    by: ['patientId'],
    where: { doctorId: userId }
  }).then(res => res.length);

  return (
    <div className="space-y-8">
      {proximoPaciente ? (
        <div className="rounded-xl border bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md overflow-hidden relative">
          <div className="p-8 relative z-10">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                   <div className="flex items-center space-x-2 text-white/80 mb-3">
                      <span className="flex h-2 w-2 rounded-full bg-white animate-pulse"></span>
                      <span className="text-xs font-bold uppercase tracking-widest">A seguir</span>
                   </div>
                   <h3 className="text-3xl md:text-4xl font-bold mb-2">{proximoPaciente.patient.name}</h3>
                   <div className="flex items-center gap-2 text-white/90 text-lg font-medium">
                      <Clock className="w-5 h-5" />
                      {proximoPaciente.date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                   </div>
                </div>
                
                <Link href={`/dashboard/atendimento/${proximoPaciente.id}`}>
                  <Button variant="secondary" size="lg" className="w-full md:w-auto font-bold shadow-lg">
                    Iniciar Atendimento
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
             </div>
          </div>
        </div>
      ) : (
        <div className="p-10 border-2 border-dashed rounded-xl text-center">
           <h3 className="text-xl font-medium text-gray-500">Você não tem mais atendimentos hoje.</h3>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
         <div className="p-6 bg-white border rounded-xl shadow-sm">
            <h3 className="font-semibold mb-2">Meus Pacientes Atendidos</h3>
            <p className="text-3xl font-bold text-primary">{meusPacientesCount}</p>
         </div>
         <div className="p-6 bg-white border rounded-xl shadow-sm hover:border-primary transition cursor-pointer flex items-center justify-between group">
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-primary">Acessar Prontuário</h3>
              <p className="text-sm text-gray-500">Buscar paciente para ver histórico</p>
            </div>
            <ArrowRight className="text-gray-300 group-hover:text-primary" />
         </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------
// COMPONENTE: Dashboard do Owner (Dono)
// ---------------------------------------------------------
async function OwnerDashboard() {
  const totalPacientes = await prisma.patient.count();
  const totalConsultas = await prisma.appointment.count();
  
  // Exemplo simplificado de faturamento do mês atual
  const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const faturamento = await prisma.financialRecord.aggregate({
     _sum: { amount: true },
     where: { 
       type: "INCOME",
       date: { gte: inicioMes }
     }
  });

  const ultimosPacientes = await prisma.patient.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
         <h2 className="text-3xl font-bold tracking-tight text-gray-900">Visão Geral da Clínica</h2>
         <p className="text-muted-foreground">Métricas administrativas e financeiras.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-white p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Faturamento (Mês)</p>
            <p className="text-2xl font-bold mt-1 text-green-600">
               R$ {faturamento._sum.amount?.toString() || "0.00"}
            </p>
          </div>
          <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center text-green-600">
            <DollarSign className="h-6 w-6" />
          </div>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Base de Pacientes</p>
            <p className="text-2xl font-bold mt-1">{totalPacientes}</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
            <Users className="h-6 w-6" />
          </div>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Atendimentos</p>
            <p className="text-2xl font-bold mt-1 text-primary">{totalConsultas}</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
            <Activity className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Lista de Últimos Pacientes */}
      <div className="rounded-xl border bg-white shadow-sm">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-semibold text-lg">Últimos Cadastros</h3>
            <Link href="/dashboard/pacientes" className="text-sm text-primary hover:underline">Ver todos</Link>
          </div>
          <div className="p-0">
             <div className="divide-y divide-gray-100">
                {ultimosPacientes.map((paciente) => (
                    <div key={paciente.id} className="flex items-center p-4 hover:bg-gray-50 transition-colors">
                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-sm">
                        {paciente.name.substring(0,2).toUpperCase()}
                    </div>
                    <div className="ml-4 space-y-1 flex-1">
                        <p className="text-sm font-medium text-gray-900">{paciente.name}</p>
                        <p className="text-xs text-muted-foreground">{paciente.phone}</p>
                    </div>
                    <div className="text-xs text-muted-foreground bg-gray-50 px-2 py-1 rounded-md border">
                        {new Date(paciente.createdAt).toLocaleDateString('pt-BR')}
                    </div>
                    </div>
                ))}
             </div>
          </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------
// PÁGINA PRINCIPAL (ROTEADOR)
// ---------------------------------------------------------
export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const role = session.user.role as UserRole;

  switch (role) {
    case "OWNER":
      return <OwnerDashboard />;
    case "DOCTOR":
      return <DoctorDashboard userId={session.user.id} />;
    case "SECRETARY":
      return <SecretaryDashboard />;
    default:
      return (
        <div className="p-10 text-center">
          <p>Papel de usuário não definido. Contate o suporte.</p>
        </div>
      );
  }
}