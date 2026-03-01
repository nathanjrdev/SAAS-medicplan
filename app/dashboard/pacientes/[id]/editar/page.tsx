import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { updatePatient } from "@/app/actions/pacientes";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarPacientePage({ params }: PageProps) {
  const { id } = await params;

  const paciente = await prisma.patient.findUnique({
    where: { id }
  });

  if (!paciente) return <div>Paciente não encontrado</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href={`/dashboard/pacientes/${id}`}
          className="p-2 rounded-lg border bg-card hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-4 w-4 text-muted-foreground" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Editar Paciente</h2>
          <p className="text-muted-foreground">Atualize os dados cadastrais.</p>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <form action={updatePatient} className="space-y-4">
          <input type="hidden" name="id" value={paciente.id} />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome Completo</label>
              <input 
                name="name" 
                defaultValue={paciente.name}
                required
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            {/* CAMPO NOVO: E-MAIL */}
            <div className="space-y-2">
              <label className="text-sm font-medium">E-mail</label>
              <input 
                name="email" 
                type="email"
                defaultValue={paciente.email || ""} // Usa vazio se for null
                placeholder="email@exemplo.com"
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">CPF</label>
              <input 
                name="cpf" 
                defaultValue={paciente.cpf}
                required
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Telefone</label>
              <input 
                name="phone" 
                defaultValue={paciente.phone}
                required
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3 justify-end">
            <Link 
                href={`/dashboard/pacientes/${id}`}
                className="px-4 py-2 text-sm font-medium border rounded-md hover:bg-muted transition-colors"
            >
                Cancelar
            </Link>
            <button 
              type="submit"
              className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-8 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}