import Link from "next/link";
import { Plus, FileText, Trash2, Search as SearchIcon } from "lucide-react";
import { getPatients, deletePatient } from "@/app/actions/pacientes";
import Search from "@/app/components/search";
import { Button } from "@/components/ui/button"; 

export default async function PacientesPage({
  searchParams,
}: {
  searchParams?: Promise<{ query?: string }>;
}) {
  const params = await searchParams;
  const query = params?.query || "";
  
  const pacientes = await getPatients(query);

  return (
    <div className="space-y-8">
      {/* Header com Alinhamento Melhorado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Pacientes</h2>
          <p className="text-muted-foreground mt-1">Gerencie os cadastros e prontuários da clínica.</p>
        </div>
        <Link href="/dashboard/pacientes/novo">
          <Button className="w-full sm:w-auto flex items-center gap-2 shadow-sm">
            <Plus className="h-4 w-4" />
            Novo Paciente
          </Button>
        </Link>
      </div>

      {/* Área de Busca e Filtros */}
      <div className="flex items-center space-x-2 bg-white p-1 rounded-lg border max-w-md shadow-sm">
         <Search placeholder="Buscar por nome, CPF ou telefone..." />
      </div>

      {/* Tabela de Pacientes */}
      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm text-left">
            <thead className="bg-gray-50/50 border-b">
              <tr>
                <th className="h-12 px-6 align-middle font-medium text-gray-500 w-[40%]">Nome</th>
                <th className="h-12 px-6 align-middle font-medium text-gray-500">CPF</th>
                <th className="h-12 px-6 align-middle font-medium text-gray-500">Telefone</th>
                <th className="h-12 px-6 align-middle font-medium text-gray-500 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pacientes.map((paciente) => (
                <tr key={paciente.id} className="hover:bg-gray-50/80 transition-colors group">
                  <td className="p-6 align-middle font-medium text-gray-900">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                        {paciente.name.substring(0,2).toUpperCase()}
                      </div>
                      <span className="truncate">{paciente.name}</span>
                    </div>
                  </td>
                  <td className="p-6 align-middle text-gray-600 whitespace-nowrap">{paciente.cpf}</td>
                  <td className="p-6 align-middle text-gray-600 whitespace-nowrap">{paciente.phone}</td>
                  <td className="p-6 align-middle text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      {/* Botão Ver Prontuário */}
                      <Link 
                        href={`/dashboard/pacientes/${paciente.id}`}
                        title="Abrir Prontuário"
                      >
                         <div className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-blue-50 text-blue-600 transition-colors border border-transparent hover:border-blue-100">
                            <FileText className="h-4 w-4" />
                         </div>
                      </Link>

                      {/* Botão Excluir */}
                      <form action={deletePatient}>
                          <input type="hidden" name="id" value={paciente.id} />
                          <button 
                            type="submit"
                            className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-red-50 text-red-600 transition-colors border border-transparent hover:border-red-100"
                            title="Excluir Paciente"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
              {pacientes.length === 0 && (
                <tr>
                    <td colSpan={4} className="p-12 text-center text-muted-foreground">
                        <div className="flex flex-col items-center gap-2">
                           <SearchIcon className="h-8 w-8 text-gray-300" />
                           <p>Nenhum paciente encontrado para "{query}".</p>
                        </div>
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}