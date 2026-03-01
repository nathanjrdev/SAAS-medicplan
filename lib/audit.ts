import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

type AuditParams = {
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW' | 'LOGIN' | 'LOGOUT';
  resource: string;
  resourceId?: string;
  oldData?: any;
  newData?: any;
};

export async function logAudit({ action, resource, resourceId, oldData, newData }: AuditParams) {
  try {
    const session = await getServerSession(authOptions);
    
    // Fallbacks para sistema ou rotinas automáticas
    const userId = session?.user?.id || 'SYSTEM';
    const tenantId = session?.user?.tenantId;
    const userEmail = session?.user?.email;

    if (!tenantId) {
      // Se não tem tenant, pode ser um erro de contexto ou admin global.
      // Logamos apenas aviso para não travar a aplicação.
      console.warn("Tentativa de auditoria sem TenantID definido na sessão.");
      return;
    }

    const headerList = headers();
    const ip = headerList.get("x-forwarded-for") || "unknown";
    const userAgent = headerList.get("user-agent") || "unknown";

    await prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        userEmail,
        action,
        resource,
        resourceId,
        oldData: oldData ? JSON.parse(JSON.stringify(oldData)) : undefined,
        newData: newData ? JSON.parse(JSON.stringify(newData)) : undefined,
        ipAddress: ip,
        userAgent,
      },
    });
  } catch (error) {
    console.error("FALHA CRÍTICA DE AUDITORIA:", error);
    // Em ambientes bancários, aqui lançaríamos erro para abortar a transação.
    // Para clínica, logar o erro no console do servidor é suficiente por ora.
  }
}