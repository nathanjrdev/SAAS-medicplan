// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs' // Se não tiver, instale: npm i bcryptjs

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando o seed...')

  // 1. Limpar banco (opcional, cuidado em produção)
  // await prisma.user.deleteMany()
  // await prisma.tenant.deleteMany()

  // 2. Criar o Tenant (A Clínica)
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Clínica Vida Saudável',
      slug: 'clinica-vida-saudavel', // Para a URL pública
      plan: 'PRO',
      primaryColor: '#0ea5e9', // Azul bonito
    }
  })

  console.log(`✅ Tenant criado: ${tenant.name} (${tenant.id})`)

  // 3. Criar o Dono da Clínica (Owner)
  const passwordHash = await hash('123456', 10) // Senha padrão para testes

  const owner = await prisma.user.create({
    data: {
      name: 'Dr. Kauã Martins',
      email: 'admin@clinica.com',
      password: passwordHash,
      role: 'OWNER',
      tenantId: tenant.id, // VINCULANDO AO TENANT (CRÍTICO)
      crm: '12345-SP',
      specialty: 'Cardiologia',
    }
  })

  console.log(`✅ Usuário criado: ${owner.email}`)

  // 4. (Opcional) Criar um Serviço Padrão
  await prisma.service.create({
    data: {
      name: 'Consulta de Rotina',
      durationMin: 30,
      price: 250.00,
      tenantId: tenant.id
    }
  })

  console.log('✅ Serviço padrão criado.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })