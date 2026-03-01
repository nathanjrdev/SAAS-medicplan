'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createExpense } from "@/app/actions/financeiro"
import { PlusCircle } from "lucide-react"

export function NewExpenseDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    try {
      await createExpense(formData)
      setOpen(false)
    } catch (error) {
      console.error(error)
      alert("Erro ao salvar despesa. Verifique os dados.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Nova Despesa
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Despesa</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Descrição
            </Label>
            <Input id="description" name="description" className="col-span-3" required placeholder="Ex: Aluguel" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Valor (R$)
            </Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              className="col-span-3"
              required
              placeholder="0,00"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Categoria
            </Label>
            <div className="col-span-3">
              <Select name="category" required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RENT">Aluguel</SelectItem>
                  <SelectItem value="SALARY">Salários</SelectItem>
                  <SelectItem value="SUPPLIES">Suprimentos</SelectItem>
                  <SelectItem value="TAXES">Impostos</SelectItem>
                  <SelectItem value="MARKETING">Marketing</SelectItem>
                  <SelectItem value="OTHER">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">
              Data
            </Label>
            <Input
              id="date"
              name="date"
              type="date"
              defaultValue={new Date().toISOString().split('T')[0]}
              className="col-span-3"
              required
            />
          </div>
          <div className="flex justify-end pt-4">
             <Button type="submit" disabled={loading}>
                {loading ? "Salvando..." : "Salvar"}
             </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}