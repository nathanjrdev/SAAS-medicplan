import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import ReceitaSimples from "@/app/components/receita-simples";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function ReceitaPage({ params }: { params: { id: string } }) {
  // 1. Segurança e Sessão
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  // @ts-ignore
  const tenantId = session.user.tenantId; // ID da Clínica
  const userId = session.user.id;         // ID do Médico

  const { id } = params;

  // 2. Busca Paciente (Protegido por Tenant)
  const patient = await prisma.patient.findUnique({
    where: { 
        id,
        tenantId: tenantId 
    }
  });

  if (!patient) return notFound();

  // 3. Busca Médico e Dados da Clínica (Tenant)
  const doctor = await prisma.user.findUnique({
    where: { id: userId },
    include: {
        tenant: true // Traz os dados da clínica (Nome, Logo, etc)
    }
  });

  if (!doctor) return notFound();

  return (
    <ReceitaSimples 
      patientId={patient.id}
      patientName={patient.name}
      doctorName={doctor.name}
      crm={doctor.crm || ""}
      // Agora pegamos do Tenant (Clínica) e não do User
      clinicName={doctor.tenant.name} 
      clinicAddress={"Endereço configurável no Tenant"} // Você pode adicionar address no model Tenant depois
      clinicPhone={doctor.tenant.whatsappPhone || ""}
      clinicLogo={doctor.tenant.logoUrl}
    />
  );
}