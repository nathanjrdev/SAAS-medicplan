'use client'

import { useState } from "react"
import { registerTenant } from "@/app/actions/auth/register-tenant"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { CheckCircle2, Star } from "lucide-react"
import Link from "next/link"

export default function RegisterPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  // Adicionado tipo "LIFETIME"
  const [selectedPlan, setSelectedPlan] = useState<"STANDARD" | "PRO" | "LIFETIME">("STANDARD")

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData(event.currentTarget)
    formData.append("planType", selectedPlan)
    
    const result = await registerTenant(formData)
    
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4 py-10">
      <Card className="w-full max-w-4xl"> {/* Aumentei a largura para caber 3 cards */}
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Crie sua conta</CardTitle>
          <CardDescription>
            Escolha o plano ideal para sua clínica
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Seleção de Planos - Agora com 3 colunas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* PLANO STANDARD */}
              <div 
                onClick={() => setSelectedPlan("STANDARD")}
                className={`cursor-pointer border-2 rounded-xl p-4 transition-all hover:border-blue-400 ${
                  selectedPlan === "STANDARD" ? "border-blue-600 bg-blue-50" : "border-gray-200"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg">Mensal</h3>
                  {selectedPlan === "STANDARD" && <CheckCircle2 className="text-blue-600 h-5 w-5" />}
                </div>
                <p className="text-2xl font-bold mb-2">R$ 97<span className="text-sm font-normal text-gray-500">/mês</span></p>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>✓ Agenda Online</li>
                  <li>✓ Prontuário Simples</li>
                </ul>
              </div>

              {/* PLANO PRO */}
              <div 
                onClick={() => setSelectedPlan("PRO")}
                className={`cursor-pointer border-2 rounded-xl p-4 transition-all hover:border-blue-400 ${
                  selectedPlan === "PRO" ? "border-blue-600 bg-blue-50" : "border-gray-200"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg">Pro</h3>
                  {selectedPlan === "PRO" && <CheckCircle2 className="text-blue-600 h-5 w-5" />}
                </div>
                <p className="text-2xl font-bold mb-2">R$ 197<span className="text-sm font-normal text-gray-500">/mês</span></p>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>✓ Financeiro Completo</li>
                  <li>✓ Múltiplos Médicos</li>
                </ul>
              </div>

              {/* PLANO VITALÍCIO */}
              <div 
                onClick={() => setSelectedPlan("LIFETIME")}
                className={`cursor-pointer border-2 rounded-xl p-4 transition-all hover:border-yellow-400 relative overflow-hidden ${
                  selectedPlan === "LIFETIME" ? "border-yellow-500 bg-yellow-50" : "border-gray-200"
                }`}
              >
                {/* Faixa de destaque */}
                <div className="absolute top-0 right-0 bg-yellow-500 text-white text-xs px-2 py-1 rounded-bl-lg font-bold">
                  MELHOR OPÇÃO
                </div>

                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg flex items-center gap-1">
                     Vitalício <Star className="h-4 w-4 fill-yellow-500 text-yellow-500"/>
                  </h3>
                  {selectedPlan === "LIFETIME" && <CheckCircle2 className="text-yellow-600 h-5 w-5" />}
                </div>
                <p className="text-2xl font-bold mb-2">R$ 997<span className="text-sm font-normal text-gray-500">/único</span></p>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>✓ Acesso para sempre</li>
                  <li>✓ Sem mensalidade</li>
                  <li>✓ Todas as atualizações</li>
                </ul>
              </div>
            </div>

            {/* Campos do Formulário (Iguais) */}
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="clinicName">Nome da Clínica</Label>
                <Input id="clinicName" name="clinicName" placeholder="Ex: Clínica Saúde Vida" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Seu Nome Completo</Label>
                <Input id="name" name="name" placeholder="Dr. João Silva" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail Profissional</Label>
                <Input id="email" name="email" type="email" placeholder="joao@clinica.com" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input id="password" name="password" type="password" required />
              </div>
            </div>

            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full h-12 text-lg" disabled={loading}>
              {loading ? "Processando..." : `Confirmar Plano ${
                selectedPlan === "LIFETIME" ? "Vitalício" : selectedPlan === "STANDARD" ? "Padrão" : "Pro"
              }`}
            </Button>
            
            <div className="text-center text-sm text-gray-600">
              Já tem uma conta? <Link href="/login" className="text-blue-600 hover:underline font-medium">Faça login</Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}