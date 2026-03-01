import Link from "next/link";
import { User, Phone, MapPin, Shield, ArrowLeft, Save } from "lucide-react";
import { createPatient } from "@/app/actions/pacientes";

export default function NovoPacientePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Cabeçalho */}
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/pacientes" 
          className="p-2 rounded-lg border bg-card hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-4 w-4 text-muted-foreground" />
        </Link>
        <div>
          <h2 className="text-xl font-bold tracking-tight">Novo Paciente</h2>
          <p className="text-sm text-muted-foreground">Preencha os dados para criar uma ficha.</p>
        </div>
      </div>

      {/* FORMULÁRIO CONECTADO 
         A "action" chama a função do servidor diretamente.
      */}
      <form action={createPatient} className="grid gap-6 md:grid-cols-3">
        
        {/* Coluna Principal */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Seção 1: Dados Pessoais */}
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 border-b pb-2">
              <User className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm">Dados Pessoais</h3>
            </div>
            
            <div className="grid gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome Completo</label>
                <input 
                  name="name"
                  required
                  placeholder="Ex: João da Silva"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">CPF</label>
                  <input 
                    name="cpf"
                    required
                    placeholder="000.000.000-00"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Data de Nasc.</label>
                  <input 
                    name="birthDate"
                    type="date"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Seção 2: Contato */}
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 border-b pb-2">
              <Phone className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm">Contato</h3>
            </div>
            
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Celular</label>
                  <input 
                    name="phone"
                    required
                    placeholder="(11) 99999-9999"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <input 
                    name="email"
                    type="email"
                    placeholder="joao@email.com"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Coluna Lateral */}
        <div className="space-y-6">
          
          <div className="rounded-xl border bg-card p-6 shadow-sm">
             <div className="flex items-center gap-2 mb-4 border-b pb-2">
              <Shield className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm">Convênio</h3>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Plano de Saúde</label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <option value="particular">Particular</option>
                  <option value="unimed">Unimed</option>
                  <option value="bradesco">Bradesco Saúde</option>
                </select>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex flex-col gap-3">
            <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary h-12 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
              <Save className="h-4 w-4" />
              Salvar Paciente
            </button>
            <Link 
              href="/dashboard/pacientes"
              className="flex w-full items-center justify-center rounded-lg border bg-transparent h-10 text-sm font-medium hover:bg-muted transition-colors"
            >
              Cancelar
            </Link>
          </div>

        </div>
      </form>
    </div>
  );
}