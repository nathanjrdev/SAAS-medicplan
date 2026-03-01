'use server'

import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { ExpenseCategory } from "@prisma/client"

export type FinancialTransaction = {
  id: string
  date: Date
  description: string
  amount: number
  type: 'INCOME' | 'EXPENSE'
  categoryOrMethod: string
}

export type FinancialMetrics = {
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  transactions: FinancialTransaction[]
}

export async function createExpense(formData: FormData) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    throw new Error("Não autorizado")
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { tenantId: true }
  })

  if (!user?.tenantId) throw new Error("Usuário sem clínica vinculada")

  const description = formData.get("description") as string
  const amount = parseFloat(formData.get("amount") as string)
  const category = formData.get("category") as ExpenseCategory
  const dateStr = formData.get("date") as string
  const date = dateStr ? new Date(dateStr + "T12:00:00") : new Date()

  if (!description || isNaN(amount) || !category) {
    throw new Error("Dados inválidos")
  }

  await prisma.expense.create({
    data: {
      description,
      amount,
      category,
      date,
      tenantId: user.tenantId,
    },
  })

  revalidatePath("/dashboard/financeiro")
}

export async function deleteExpense(id: string) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) throw new Error("Não autorizado")

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { tenantId: true }
  })

  if (!user?.tenantId) throw new Error("Usuário sem clínica vinculada")

  const expense = await prisma.expense.findFirst({
    where: { 
      id,
      tenantId: user.tenantId
    },
  })

  if (!expense) throw new Error("Operação não permitida")

  await prisma.expense.delete({
    where: { id },
  })

  revalidatePath("/dashboard/financeiro")
}

export async function getFinancialMetrics(): Promise<FinancialMetrics> {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    return { totalRevenue: 0, totalExpenses: 0, netProfit: 0, transactions: [] }
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { tenantId: true }
  })

  if (!user?.tenantId) return { totalRevenue: 0, totalExpenses: 0, netProfit: 0, transactions: [] }

  const tenantId = user.tenantId

  // 1. Receitas
  const appointments = await prisma.appointment.findMany({
    where: {
      tenantId,
      status: { not: 'CANCELLED' },
    },
    select: {
      id: true,
      date: true,
      price: true,
      paymentMethod: true,
      patient: { select: { name: true } },
    },
    orderBy: { date: 'desc' },
    take: 50
  })

  // 2. Despesas
  const expenses = await prisma.expense.findMany({
    where: { tenantId },
    orderBy: { date: 'desc' },
    take: 50
  })

  // 3. Totais
  const totalRevenue = appointments.reduce((acc, curr) => acc + Number(curr.price), 0)
  const totalExpenses = expenses.reduce((acc, curr) => acc + Number(curr.amount), 0)
  const netProfit = totalRevenue - totalExpenses

  // 4. Extrato Unificado
  const incomeTransactions: FinancialTransaction[] = appointments.map(app => ({
    id: app.id,
    date: app.date,
    description: `Consulta - ${app.patient.name}`,
    amount: Number(app.price),
    type: 'INCOME',
    categoryOrMethod: app.paymentMethod || 'Pendente'
  }))

  const expenseTransactions: FinancialTransaction[] = expenses.map(exp => ({
    id: exp.id,
    date: exp.date,
    description: exp.description,
    amount: Number(exp.amount),
    type: 'EXPENSE',
    categoryOrMethod: exp.category
  }))

  const transactions = [...incomeTransactions, ...expenseTransactions].sort(
    (a, b) => b.date.getTime() - a.date.getTime()
  )

  return {
    totalRevenue,
    totalExpenses,
    netProfit,
    transactions
  }
}