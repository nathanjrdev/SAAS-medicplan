'use client'

import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu" // Certifique-se que tem esse componente UI instalado ou use um simples
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar" // Opcional, se tiver
import { signOut } from "next-auth/react"
import { LogOut, User as UserIcon } from "lucide-react"

export function UserNav({ user }: { user: { name?: string | null, email?: string | null } }) {
  return (
    <div className="flex items-center gap-4">
        <div className="text-right hidden md:block">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>
        <Button 
            variant="ghost" 
            size="icon"
            onClick={() => signOut({ callbackUrl: "/" })}
            title="Sair do sistema"
        >
            <LogOut className="h-5 w-5 text-red-500" />
        </Button>
    </div>
  )
}