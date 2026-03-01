"use client"

import { useState, useEffect } from "react"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Smartphone, 
  RefreshCcw, 
  Wifi, 
  WifiOff, 
  Send, 
  Bot, 
  Save,
  CheckCircle2,
  AlertCircle
} from "lucide-react"

export default function IntegracoesPage() {
  const [status, setStatus] = useState("CHECKING") 
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  
  // Estados para o Teste de Envio
  const [testPhone, setTestPhone] = useState("")
  const [testMessage, setTestMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [lastLog, setLastLog] = useState<{time: string, status: 'success' | 'error', msg: string} | null>(null)

  // Estados da IA (Mockados por enquanto, depois conectamos no banco)
  const [aiPrompt, setAiPrompt] = useState("Você é a assistente virtual da Clínica. Seja educada, formal e ajude os pacientes a agendar consultas.")
  const [welcomeMsg, setWelcomeMsg] = useState("Olá! Sou a assistente virtual da Clínica. Como posso ajudar você hoje?")

  // Função para checar status no Bot
  const checkStatus = async () => {
    try {
      setLoading(true)
      const res = await fetch('http://localhost:3001/api/status')
      const data = await res.json()
      
      if (data.status === 'CONNECTED') {
        setStatus("CONNECTED")
      } else if (data.status === 'QRCODE_READY') {
        setStatus("QRCODE")
        fetchQrCode()
      } else {
        setStatus("DISCONNECTED")
      }
    } catch (error) {
      console.error("Erro ao conectar com bot:", error)
      setStatus("ERROR")
    } finally {
      setLoading(false)
    }
  }

  const fetchQrCode = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/qrcode')
      const data = await res.json()
      if (data.qrcode) {
        setQrCode(data.qrcode)
      }
    } catch (error) {
      console.error("Erro ao buscar QR:", error)
    }
  }

  // Função para enviar mensagem de teste
  const handleSendTest = async () => {
    if (!testPhone || !testMessage) return;
    
    setSending(true)
    try {
      const res = await fetch('http://localhost:3001/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: testPhone,
          message: testMessage
        })
      })
      
      if (res.ok) {
        setLastLog({
          time: new Date().toLocaleTimeString(),
          status: 'success',
          msg: 'Mensagem enviada com sucesso!'
        })
        setTestMessage("") // Limpa o campo
      } else {
        throw new Error("Falha no envio")
      }
    } catch (error) {
      setLastLog({
          time: new Date().toLocaleTimeString(),
          status: 'error',
          msg: 'Erro ao enviar. Verifique se o número está correto.'
      })
    } finally {
      setSending(false)
    }
  }

  useEffect(() => {
    checkStatus()
    const interval = setInterval(() => {
        if (status !== 'CONNECTED' && status !== 'ERROR') {
            checkStatus();
        }
    }, 5000);
    return () => clearInterval(interval);
  }, [status])

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Integrações & AI</h2>
        <div className="flex items-center space-x-2">
          <Badge variant={status === "CONNECTED" ? "default" : "destructive"} className="px-4 py-1 text-sm">
             {status === "CONNECTED" ? "WhatsApp Online" : "WhatsApp Offline"}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="conexao" className="space-y-4">
        <TabsList>
          <TabsTrigger value="conexao">Conexão & Teste</TabsTrigger>
          <TabsTrigger value="automacao">Cérebro da IA</TabsTrigger>
        </TabsList>

        {/* ABA 1: CONEXÃO E TESTE */}
        <TabsContent value="conexao" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            
            {/* STATUS / QR CODE */}
            <Card className="col-span-4 lg:col-span-3">
              <CardHeader>
                <CardTitle>Status do Dispositivo</CardTitle>
                <CardDescription>Gerencie a conexão do seu WhatsApp.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center min-h-[300px]">
                {status === "ERROR" && (
                    <Alert variant="destructive">
                        <WifiOff className="h-4 w-4" />
                        <AlertTitle>Erro de Conexão</AlertTitle>
                        <AlertDescription>Verifique se o 'node server.js' está rodando.</AlertDescription>
                    </Alert>
                )}

                {status === "CHECKING" && (
                     <div className="flex flex-col items-center text-gray-500">
                        <RefreshCcw className="h-8 w-8 animate-spin mb-2" />
                        <p>Verificando...</p>
                     </div>
                )}

                {status === "CONNECTED" && (
                  <div className="flex flex-col items-center text-center space-y-4 animate-in fade-in zoom-in duration-300">
                    <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center shadow-inner">
                      <Wifi className="h-10 w-10 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-green-700">Tudo pronto!</h3>
                      <p className="text-sm text-gray-500">O bot está ativo e escutando mensagens.</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={checkStatus}>Atualizar Status</Button>
                  </div>
                )}

                {(status === "QRCODE" || status === "DISCONNECTED") && (
                  <div className="flex flex-col items-center space-y-4">
                     {qrCode ? (
                        <div className="border-4 border-black p-2 rounded bg-white">
                           <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                        </div>
                     ) : (
                        <div className="w-48 h-48 bg-gray-100 rounded flex items-center justify-center">
                           <Smartphone className="h-10 w-10 text-gray-300" />
                        </div>
                     )}
                     <Button onClick={checkStatus} disabled={loading}>
                       {loading ? "Carregando..." : "Gerar QR Code"}
                     </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* TESTE DE ENVIO */}
            <Card className="col-span-4 lg:col-span-4 border-blue-100 bg-blue-50/30">
               <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                    <Send className="h-5 w-5 text-blue-600" />
                    Teste de Disparo
                 </CardTitle>
                 <CardDescription>Envie uma mensagem agora para validar a integração.</CardDescription>
               </CardHeader>
               <CardContent className="space-y-4">
                 <div className="space-y-2">
                    <Label>Número do Destinatário (com DDD)</Label>
                    <Input 
                        placeholder="Ex: 11999998888" 
                        value={testPhone}
                        onChange={(e) => setTestPhone(e.target.value)}
                    />
                 </div>
                 <div className="space-y-2">
                    <Label>Mensagem</Label>
                    <Textarea 
                        placeholder="Olá, isso é um teste do sistema..." 
                        value={testMessage}
                        onChange={(e) => setTestMessage(e.target.value)}
                    />
                 </div>

                 {lastLog && (
                    <div className={`p-3 rounded-md text-sm flex items-center gap-2 ${lastLog.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {lastLog.status === 'success' ? <CheckCircle2 size={16}/> : <AlertCircle size={16}/>}
                        <span>{lastLog.msg} <span className="text-xs opacity-70">({lastLog.time})</span></span>
                    </div>
                 )}
               </CardContent>
               <CardFooter>
                 <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleSendTest} disabled={sending || status !== 'CONNECTED'}>
                    {sending ? "Enviando..." : "Enviar Mensagem de Teste"}
                 </Button>
               </CardFooter>
            </Card>
          </div>
        </TabsContent>

        {/* ABA 2: AUTOMAÇÃO (IA) */}
        <TabsContent value="automacao">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bot className="h-5 w-5 text-purple-600" />
                        Personalidade da IA
                    </CardTitle>
                    <CardDescription>Defina como a inteligência artificial deve se comportar.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Prompt do Sistema (Instruções)</Label>
                        <Textarea 
                            className="min-h-[150px] font-mono text-sm"
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                            Instrua a IA sobre o nome da clínica, horários e tom de voz.
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Fluxos Automáticos</CardTitle>
                    <CardDescription>Mensagens padrão para novos contatos.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Mensagem de Boas-vindas</Label>
                        <Textarea 
                            value={welcomeMsg}
                            onChange={(e) => setWelcomeMsg(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                            Enviada automaticamente quando alguém manda "Oi" pela primeira vez.
                        </p>
                    </div>
                    <Button className="w-full mt-4" variant="secondary">
                        <Save className="mr-2 h-4 w-4" /> Salvar Configurações
                    </Button>
                </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}