import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Settings, 
  DollarSign,
  MessageCircle,
  Menu
} from "lucide-react"
import { UserNav } from "./_components/user-nav"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { hasPermission } from "@/lib/permissions"
import { UserRole } from "@prisma/client"

function hexToHSL(hex: string) {
  hex = hex.replace(/^#/, '');
  let r = parseInt(hex.substring(0, 2), 16) / 255;
  let g = parseInt(hex.substring(2, 4), 16) / 255;
  let b = parseInt(hex.substring(4, 6), 16) / 255;
  let max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return `${(h * 360).toFixed(1)} ${(s * 100).toFixed(1)}% ${(l * 100).toFixed(1)}%`;
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login")
  }

  // Busca dados atualizados do usuário e tenant
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, role: true, tenantId: true }
  })

  if (!user) redirect("/login")

  const tenant = await prisma.tenant.findUnique({
    where: { id: user.tenantId },
    select: { name: true, primaryColor: true, slug: true }
  })

  const themeColor = tenant?.primaryColor || "#0f172a"; 
  const hslColor = hexToHSL(themeColor);
  const userRole = user.role as UserRole;

  return (
    <div className="min-h-screen flex bg-gray-50/50">
      <style>{`
        :root {
          --primary: ${hslColor};
          --primary-foreground: 0 0% 100%;
        }
        .bg-brand { background-color: ${themeColor}; }
        .text-brand { color: ${themeColor}; }
        .border-brand { border-color: ${themeColor}; }
      `}</style>

      {/* Sidebar Desktop */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col fixed h-full z-10">
        <div className="h-16 flex items-center px-6 border-b border-gray-100 gap-3">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold shrink-0"
            style={{ backgroundColor: themeColor }}
          >
             {tenant?.name?.substring(0, 1).toUpperCase() || "C"}
          </div>
          <span className="font-semibold text-gray-800 truncate">
            {tenant?.name || "Consultório"}
          </span>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-brand transition-colors">
            <LayoutDashboard size={18} />
            Início
          </Link>
          
          {hasPermission(userRole, "manage:schedule") && (
            <Link href="/dashboard/agenda" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-brand transition-colors">
              <Calendar size={18} />
              Agenda
            </Link>
          )}

          {hasPermission(userRole, "manage:patients") && (
            <Link href="/dashboard/pacientes" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-brand transition-colors">
              <Users size={18} />
              Pacientes
            </Link>
          )}

          {hasPermission(userRole, "manage:financial") && (
            <Link href="/dashboard/financeiro" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-brand transition-colors">
              <DollarSign size={18} />
              Financeiro
            </Link>
          )}
          
          {hasPermission(userRole, "manage:settings") && (
            <Link href="/dashboard/integracoes" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-brand transition-colors">
              <MessageCircle size={18} />
              WhatsApp AI
            </Link>
          )}

          {hasPermission(userRole, "manage:settings") && (
            <Link href="/dashboard/configuracoes" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-brand transition-colors">
              <Settings size={18} />
              Configurações
            </Link>
          )}
        </nav>

        <div className="p-4 border-t border-gray-100">
           <UserNav user={user} />
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="bg-white border-b border-gray-200 h-16 px-4 flex items-center justify-between md:hidden sticky top-0 z-20">
           <div className="flex items-center gap-2">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: themeColor }}
              >
                {tenant?.name?.substring(0, 1).toUpperCase() || "C"}
              </div>
              <span className="font-semibold text-sm truncate max-w-[150px]">{tenant?.name}</span>
           </div>
           
           <Sheet>
             <SheetTrigger asChild>
               <Button variant="ghost" size="icon"><Menu className="h-5 w-5" /></Button>
             </SheetTrigger>
             <SheetContent side="left" className="p-0">
                <div className="p-6">Menu Mobile (Em breve)</div>
             </SheetContent>
           </Sheet>
        </header>

        {/* Main Wrapper */}
        <main className="flex-1 overflow-y-auto bg-gray-50/50 p-4 md:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}