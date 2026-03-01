'use client'

import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { deleteExpense } from "@/app/actions/financeiro"
import { useTransition } from "react"

export function DeleteExpenseButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition()

  return (
    <Button
      variant="ghost"
      size="icon"
      className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
      disabled={isPending}
      onClick={() => {
        if (confirm("Tem certeza que deseja excluir esta despesa?")) {
          startTransition(async () => {
            await deleteExpense(id)
          })
        }
      }}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  )
}