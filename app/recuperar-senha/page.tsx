'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft, CheckCircle2 } from "lucide-react"

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    
    // Simulação de envio de email
    // Aqui você conectaria com uma Server Action + Resend no futuro
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setLoading(false)
    setSubmitted(true)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <Link href="/login" className="text-gray-500 hover:text-gray-900 transition-colors">
               <ArrowLeft className="h-5 w-5" />
            </Link>
            <CardTitle className="text-2xl font-bold">Recuperar senha</CardTitle>
          </div>
          <CardDescription>
            {!submitted 
              ? "Digite seu e-mail para receber as instruções de redefinição." 
              : "Verifique sua caixa de entrada."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail Cadastrado</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="nome@exemplo.com" 
                  required 
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Enviando..." : "Enviar Link de Recuperação"}
              </Button>
            </form>
          ) : (
            <div className="text-center py-6 space-y-4">
              <div className="bg-green-100 text-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">E-mail enviado!</h3>
              <p className="text-gray-500 text-sm">
                Se existir uma conta com este e-mail, você receberá um link para criar uma nova senha em instantes.
              </p>
              <Button asChild className="w-full mt-4" variant="outline">
                <Link href="/login">Voltar para o Login</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}