'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { finishConsultation } from "@/app/actions/atendimento"
import { Loader2, Plus, Trash2 } from "lucide-react"

interface Props {
  appointmentId: string
  patientId: string
}

export function ConsultationForm({ appointmentId, patientId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [medications, setMedications] = useState<string[]>([])
  const [newMed, setNewMed] = useState("")

  const addMedication = () => {
    if (newMed.trim()) {
      setMedications([...medications, newMed.trim()])
      setNewMed("")
    }
  }

  const removeMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index))
  }

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    
    // Combina a lista dinâmica de medicamentos em uma string formatada para salvar
    const prescriptionText = medications.map(m => `• ${m}`).join("\n")
    formData.set("prescription", prescriptionText)

    const result = await finishConsultation(formData)

    if (result.success) {
      router.push("/dashboard/agenda")
    } else {
      alert(result.error || "Erro ao finalizar")
      setLoading(false)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
      {/* Hidden Fields */}
      <input type="hidden" name="appointmentId" value={appointmentId} />
      <input type="hidden" name="patientId" value={patientId} />

      {/* Seção Anamnese */}
      <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-8 w-1 bg-blue-500 rounded-full" />
          <h3 className="text-lg font-semibold text-slate-800">Anamnese & Evolução</h3>
        </div>
        <Label htmlFor="anamnesis" className="sr-only">Descrição</Label>
        <Textarea 
          id="anamnesis" 
          name="anamnesis"
          placeholder="Descreva as queixas do paciente, exame físico e observações clínicas..."
          className="min-h-[200px] text-base leading-relaxed p-4 resize-y border-slate-200 focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      {/* Seção Prescrição */}
      <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-8 w-1 bg-teal-500 rounded-full" />
          <h3 className="text-lg font-semibold text-slate-800">Prescrição Médica</h3>
        </div>
        
        <div className="flex gap-2">
          <Input 
            value={newMed}
            onChange={(e) => setNewMed(e.target.value)}
            placeholder="Digite o medicamento e posologia (ex: Dipirona 500mg - 1cp a cada 6h)"
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addMedication())}
          />
          <Button type="button" onClick={addMedication} variant="secondary">
            <Plus className="w-4 h-4 mr-2" /> Adicionar
          </Button>
        </div>

        {medications.length > 0 && (
          <div className="bg-slate-50 rounded-lg p-4 space-y-2 mt-4">
             {medications.map((med, idx) => (
               <div key={idx} className="flex justify-between items-center bg-white p-3 rounded border shadow-sm group">
                 <span className="text-slate-700 font-medium">
                    <span className="text-teal-600 mr-2 font-bold">{idx + 1}.</span> {med}
                 </span>
                 <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removeMedication(idx)}
                    className="text-red-400 hover:text-red-600 hover:bg-red-50"
                 >
                   <Trash2 className="w-4 h-4" />
                 </Button>
               </div>
             ))}
          </div>
        )}
        
        {/* Campo oculto para garantir que algo seja enviado se o usuário usar apenas o textarea livre se preferir mudar a lógica */}
      </div>

      {/* Footer de Ações */}
      <div className="flex justify-end pt-6 pb-12">
        <Button 
            type="submit" 
            size="lg" 
            className="bg-blue-600 hover:bg-blue-700 min-w-[200px] h-12 text-lg shadow-lg shadow-blue-200"
            disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Finalizando...
            </>
          ) : (
            "Finalizar Atendimento"
          )}
        </Button>
      </div>
    </form>
  )
}