import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileText, Globe, LayoutDashboard } from "lucide-react" 

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect("/dashboard")
  }

  // DICA: Coloque seu número de WhatsApp aqui (ex: 5511999999999)
  const whatsappNumber = "5511999999999" 
  const whatsappMessage = encodeURIComponent("Olá! Gostaria de agendar uma demonstração do SaaS Médico.")
  const demoLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg">
            <LayoutDashboard className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">SaaS Médico</span>
        </div>
        
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="font-medium">Entrar</Button>
          </Link>
          <Link href="/cadastro">
            {/* Texto ajustado: De "Começar Agora" para algo que indique assinatura */}
            <Button className="font-medium">Assinar Agora</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-20 px-4 text-center bg-gradient-to-b from-blue-50/50 to-white">
          <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900">
              Gestão inteligente para <br className="hidden md:block" />
              <span className="text-blue-600">consultórios modernos</span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Agendamentos, prontuário eletrônico e controle financeiro em uma única plataforma. 
              Simplifique sua rotina e foque no que importa: seus pacientes.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/cadastro" className="w-full sm:w-auto">
                {/* REMOVIDO "Grátis" */}
                <Button size="lg" className="w-full h-12 px-8 text-lg shadow-lg shadow-blue-600/20">
                  Começar Agora
                </Button>
              </Link>
              
              {/* Agora o botão Demonstração abre o WhatsApp */}
              <a href={demoLink} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full h-12 px-8 text-lg">
                  Agendar Demonstração
                </Button>
              </a>
            </div>
            
            {/* Features Grid simples */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 text-left">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold mb-2">Prontuário Eletrônico</h3>
                <p className="text-gray-500">Histórico completo dos pacientes, prescrições e anotações seguras.</p>
              </div>
              
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <LayoutDashboard className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-bold mb-2">Painel Financeiro</h3>
                <p className="text-gray-500">Controle receitas, despesas e fluxo de caixa com relatórios visuais.</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Globe className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-bold mb-2">Acesso Online</h3>
                <p className="text-gray-500">Acesse sua clínica de qualquer lugar, a qualquer momento, com total segurança.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-gray-500 border-t bg-gray-50">
        <p>© {new Date().getFullYear()} SaaS Médico. Todos os direitos reservados.</p>
      </footer>
    </div>
  )
}