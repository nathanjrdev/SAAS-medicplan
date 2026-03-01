import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
// Certifique-se de que process.env.ENCRYPTION_KEY tenha exatamente 32 caracteres
const SECRET_KEY = process.env.ENCRYPTION_KEY || ''; 

export function encrypt(text: string): string {
  if (!text) return text;
  if (!SECRET_KEY || SECRET_KEY.length !== 32) {
    // Em desenvolvimento, avisa. Em produção, isso deveria quebrar o build.
    console.error('ERRO CRÍTICO: ENCRYPTION_KEY inválida ou ausente (deve ter 32 chars).');
    return text; // Retorna sem criptografar para não perder dados, mas inseguro.
  }

  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(SECRET_KEY), iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag().toString('hex');

    // Formato final: IV:AuthTag:ConteudoCriptografado
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  } catch (error) {
    console.error('Erro ao criptografar:', error);
    throw new Error('Falha na criptografia de dados sensíveis.');
  }
}

export function decrypt(text: string): string {
  if (!text || !text.includes(':')) return text; // Assume que não está criptografado
  
  const parts = text.split(':');
  if (parts.length !== 3) return text; // Formato inválido

  const [ivHex, authTagHex, encryptedHex] = parts;

  try {
    if (!SECRET_KEY || SECRET_KEY.length !== 32) throw new Error('Invalid Key');

    const decipher = crypto.createDecipheriv(
      ALGORITHM, 
      Buffer.from(SECRET_KEY), 
      Buffer.from(ivHex, 'hex')
    );
    
    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));

    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Falha na descriptografia:', error);
    return '[DADO PROTEGIDO/ILEGÍVEL]';
  }
}