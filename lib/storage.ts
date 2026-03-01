import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from 'uuid';

// --- AJUSTE AQUI ---
// Adicionamos o 'endpoint' para aceitar outros provedores (Cloudflare, Backblaze, etc)
const s3Client = new S3Client({
  region: "auto", // Cloudflare R2 usa 'auto'
  endpoint: process.env.AWS_ENDPOINT, // <--- A URL do seu bucket na Cloudflare
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const BUCKET_NAME = process.env.AWS_BUCKET_NAME || "consultorio-uploads";

// ... O resto da função getPresignedUploadUrl continua IGUAL ...
export interface PresignedUrlResponse {
  uploadUrl: string;
  publicUrl: string;
  fileKey: string;
}

export async function getPresignedUploadUrl(
  originalFileName: string, 
  fileType: string
): Promise<PresignedUrlResponse> {
  
  const fileExtension = originalFileName.split('.').pop();
  const uniqueFileName = `${uuidv4()}.${fileExtension}`;
  const key = `uploads/${uniqueFileName}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: fileType,
  });

  // URL para upload
  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 120 });
  
  // --- ATENÇÃO AQUI ---
  // A URL pública na Cloudflare R2 geralmente segue o padrão do seu domínio público ou o dev URL
  // Se você habilitar "Public Access" no R2, a URL será algo como:
  // https://pub-<hash>.r2.dev/uploads/arquivo.pdf
  const publicUrl = `${process.env.AWS_PUBLIC_URL}/${key}`;

  return { uploadUrl, publicUrl, fileKey: key };
}