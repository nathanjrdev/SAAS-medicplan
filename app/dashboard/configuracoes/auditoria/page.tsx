import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default async function AuditPage({ searchParams }: { searchParams: { page?: string } }) {
  const session = await getServerSession(authOptions);
  
  // @ts-ignore
  if (!session || session.user.role !== 'OWNER') {
    return redirect("/dashboard");
  }

  const page = Number(searchParams.page) || 1;
  const limit = 20;
  const skip = (page - 1) * limit;

  // @ts-ignore
  const tenantId = session.user.tenantId;

  const logs = await prisma.auditLog.findMany({
    where: { tenantId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: skip,
    include: { user: { select: { name: true } } }
  });

  return (
    <div className="space-y-4 p-8">
      <Card>
        <CardHeader>
          <CardTitle>Registro de Auditoria (LGPD)</CardTitle>
          <p className="text-sm text-muted-foreground">
            Monitoramento de acesso e modificação de dados sensíveis.
          </p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Ação</TableHead>
                <TableHead>Recurso</TableHead>
                <TableHead>Detalhes (ID)</TableHead>
                <TableHead>IP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{log.createdAt.toLocaleString('pt-BR')}</TableCell>
                  <TableCell>{log.user?.name || log.userEmail || 'Sistema'}</TableCell>
                  <TableCell>
                    <Badge variant={log.action === 'VIEW' ? 'secondary' : 'default'}>
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell>{log.resource}</TableCell>
                  <TableCell className="font-mono text-xs">{log.resourceId}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{log.ipAddress}</TableCell>
                </TableRow>
              ))}
              {logs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    Nenhum registro de auditoria encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          
          <div className="flex justify-end gap-4 mt-4 items-center">
             {page > 1 && (
               <a href={`?page=${page - 1}`} className="text-sm text-blue-600 hover:underline">
                 &larr; Anterior
               </a>
             )}
             <span className="text-sm text-muted-foreground">Página {page}</span>
             {logs.length === limit && (
               <a href={`?page=${page + 1}`} className="text-sm text-blue-600 hover:underline">
                 Próxima &rarr;
               </a>
             )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}