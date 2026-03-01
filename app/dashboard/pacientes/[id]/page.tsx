import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { PatientTabs } from "./patient-tabs"
import Link from "next/link"
import { FileText, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

// [LGPD] Importações de Segurança
import { decrypt } from "@/lib/crypto"
import { logAudit } from "@/lib/audit"

export default async function PatientDetailsPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")
  
  // @ts-ignore
  const tenantId = session.user.tenantId

  // 1. Busca os dados no banco (que estarão criptografados)
  const patient = await prisma.patient.findUnique({
    where: { 
      id: params.id,
      tenantId: tenantId
    },
    include: {
      records: {
        orderBy: { createdAt: 'desc' },
        include: {
          attachments: true
        }
      },
      appointments: {
        orderBy: { date: 'desc' },
        take: 5
      }
    }
  })

  if (!patient) {
    return <div className="p-8">Paciente não encontrado ou acesso negado.</div>
  }

  // 2. [LGPD] Descriptografia para visualização
  // Percorremos os registros para tornar o texto legível novamente antes de enviar para a tela
  patient.records = patient.records.map(record => ({
    ...record,
    description: decrypt(record.description), // Transforma o código em texto real
    prescription: record.prescription ? decrypt(record.prescription) : null
  }))

  // 3. [LGPD] Auditoria de Acesso (VIEW)
  // Registramos que este usuário acessou a ficha completa deste paciente
  await logAudit({
    action: 'VIEW',
    resource: 'Patient',
    resourceId: patient.id,
    newData: { viewedRecordsCount: patient.records.length }
  })

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/pacientes">
            <Button variant="outline" size="icon">
              <ArrowLeft size={18} />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{patient.name}</h1>
            <p className="text-muted-foreground">Prontuário Digital • ID: {patient.id.slice(0, 8)}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
            <Link href={`/dashboard/pacientes/${patient.id}/receita`}>
                <Button variant="outline" className="gap-2">
                    <FileText size={16} />
                    Nova Receita
                </Button>
            </Link>
        </div>
      </div>

      {/* Componente de Abas (Client Side) */}
      <PatientTabs patient={patient} />
    </div>
  )
}