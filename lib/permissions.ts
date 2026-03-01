import { UserRole } from "@prisma/client";

// Definição das "Capacidades" do sistema
export type Permission = 
  | "view:dashboard_financial"
  | "view:dashboard_medical"
  | "view:dashboard_calendar"
  | "manage:financial"
  | "manage:settings"
  | "manage:users"
  | "manage:patients"
  | "manage:schedule"
  | "view:medical_records";

// Mapeamento: Quem pode fazer o quê
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  OWNER: [
    "view:dashboard_financial",
    "manage:financial",
    "manage:settings",
    "manage:users",
    "manage:patients",
    "manage:schedule",
    "view:medical_records",
  ],
  DOCTOR: [
    "view:dashboard_medical",
    "manage:patients",
    "view:medical_records",
    "manage:schedule",
  ],
  SECRETARY: [
    "view:dashboard_calendar",
    "manage:patients",
    "manage:schedule",
  ],
};

// Mapeamento: Quais rotas exigem quais cargos (Middleware)
// Se a rota não estiver aqui, assume-se que é pública para usuários logados OU controlada via componente
export const ROUTE_PERMISSIONS: Record<string, UserRole[]> = {
  "/dashboard/financeiro": ["OWNER"],
  "/dashboard/configuracoes": ["OWNER"],
  "/dashboard/integracoes": ["OWNER"], // Geralmente configurações sensíveis
  "/dashboard/auditoria": ["OWNER"],
  // Adicione outras rotas críticas aqui
};

/**
 * Verifica se o usuário tem permissão para uma ação (UI)
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/**
 * Verifica se o usuário pode acessar uma rota específica (Server/Middleware)
 */
export function canAccessRoute(role: UserRole, path: string): boolean {
  // Verifica se a rota atual começa com alguma rota protegida
  const protectedPrefix = Object.keys(ROUTE_PERMISSIONS).find((route) => 
    path.startsWith(route)
  );

  if (!protectedPrefix) return true; // Rota não listada explicitamente como restrita

  return ROUTE_PERMISSIONS[protectedPrefix].includes(role);
}