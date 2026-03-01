'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { uploadFile } from "@/lib/storage"
import { logAudit } from "@/lib/audit"
import { encrypt } from "@/lib/crypto"

export async function createMedicalRecord(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return { success: false, error: "Não autorizado" }

  const patientId = formData.get("patientId") as string
  const rawDescription = formData.get("description") as string
  const file = formData.get("file") as File | null

  if (!patientId || !rawDescription) {
    return { success: false, error: "Dados obrigatórios faltando" }
  }

  // @ts-ignore
  const doctorId = session.user.id

  try {
    // 1. Upload do arquivo (se houver) usando a nova lib
    let attachmentData = undefined
    
    if (file && file.size > 0) {
      try {
        const url = await uploadFile(file)
        attachmentData = {
          create: {
            name: file.name,
            type: file.type,
            url: url
          }
        }
      } catch (uploadError) {
        console.error("Erro no upload:", uploadError)
        return { success: false, error: "Falha ao fazer upload do arquivo" }
      }
    }

    // 2. Criptografia (LGPD)
    // Criptografamos o texto antes de salvar no banco
    const encryptedDescription = encrypt(rawDescription);

    // 3. Salva no Banco
    const newRecord = await prisma.medicalRecord.create({
      data: {
        description: encryptedDescription,
        patientId,
        doctorId,
        attachments: attachmentData 
      }
    })

    // 4. Auditoria (LGPD)
    await logAudit({
      action: 'CREATE',
      resource: 'MedicalRecord',
      resourceId: newRecord.id,
      // Não salvamos o conteúdo sensível no log, apenas metadados
      newData: { 
        patientId, 
        hasAttachment: !!attachmentData,
        recordId: newRecord.id
      }
    });

    revalidatePath(`/dashboard/pacientes/${patientId}`)
    return { success: true }

  } catch (error) {
    console.error("Erro ao criar prontuário:", error)
    return { success: false, error: "Falha ao salvar prontuário" }
  }
}