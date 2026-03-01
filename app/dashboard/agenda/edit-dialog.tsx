"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updateAppointment } from "@/app/actions/agenda"
import { Pencil, CheckCircle, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export function EditAppointmentDialog({ appointment }: { appointment: any }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Estados do formulário
  const [price, setPrice] = useState(appointment.price || 0)
  const [notes, setNotes] = useState(appointment.notes || "")
  const [status, setStatus] = useState(appointment.status || "PENDING")

  async function handleSave() {
    setLoading(true)
    try {
      await updateAppointment(appointment.id, {
        price: Number(price),
        notes,
        status
      })
      setOpen(false)
      router.refresh() // Atualiza a página de fundo
    } catch (error) {
      console.error("Erro ao salvar", error)
      alert("Erro ao atualizar agendamento")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1 text-blue-600 border-blue-200 hover:bg-blue-50">
          <Pencil className="w-3.5 h-3.5" />
          Editar / Finalizar
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Detalhes do Agendamento</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {/* STATUS */}
          <div className="grid gap-2">
            <Label>Status do Atendimento</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">Pendente</SelectItem>
                <SelectItem value="CONFIRMED">Confirmado</SelectItem>
                <SelectItem value="COMPLETED">✅ Concluído (Realizado)</SelectItem>
                <SelectItem value="CANCELLED">Cancelado</SelectItem>
                <SelectItem value="NO_SHOW">Não Compareceu</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* VALOR */}
          <div className="grid gap-2">
            <Label>Valor Final (R$)</Label>
            <Input 
              type="number" 
              step="0.01"
              value={price} 
              onChange={(e) => setPrice(e.target.value)} 
            />
            <p className="text-xs text-gray-500">
              Ajuste o valor conforme o procedimento realizado.
            </p>
          </div>

          {/* OBSERVAÇÕES */}
          <div className="grid gap-2">
            <Label>Anotações / Prontuário Rápido</Label>
            <textarea 
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Paciente relatou dores..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSave} disabled={loading} className="w-full sm:w-auto">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}