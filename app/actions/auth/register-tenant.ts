'use server'

import { prisma } from "@/lib/prisma"
import { stripe } from "@/lib/stripe"
import bcrypt from "bcryptjs"
import { redirect } from "next/navigation"

function generateSlug(name: string): string {
  const baseSlug = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  return `${baseSlug}-${randomSuffix}`;
}

export async function registerTenant(formData: FormData) {
  const clinicName = formData.get("clinicName") as string
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const planType = formData.get("planType") as string // "STANDARD", "PRO" ou "LIFETIME"

  if (!clinicName || !name || !email || !password || !planType) {
    return { error: "Todos os campos são obrigatórios." }
  }

  // Define o preço e o MODO do checkout
  let priceId = ""
  let checkoutMode: "subscription" | "payment" = "subscription"

  if (planType === 'LIFETIME') {
    priceId = process.env.STRIPE_PRICE_LIFETIME as string
    checkoutMode = "payment" // Vitalício é pagamento único
  } else if (planType === 'PRO') {
    priceId = process.env.STRIPE_PRICE_PRO as string
    checkoutMode = "subscription"
  } else {
    priceId = process.env.STRIPE_PRICE_STANDARD as string
    checkoutMode = "subscription"
  }

  if (!priceId) {
    return { error: `Erro de configuração: ID do Preço para ${planType} não encontrado.` }
  }

  const slug = generateSlug(clinicName)
  const hashedPassword = await bcrypt.hash(password, 10)
  let redirectUrl = ""

  try {
    const { tenant, user } = await prisma.$transaction(async (tx) => {
      const existingUser = await tx.user.findUnique({ where: { email } })
      if (existingUser) throw new Error("Este e-mail já está em uso.")

      const newTenant = await tx.tenant.create({
        data: {
          name: clinicName,
          slug: slug,
          plan: "INACTIVE",
        }
      })

      const newUser = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: "OWNER",
          tenantId: newTenant.id
        }
      })

      return { tenant: newTenant, user: newUser }
    })

    // Stripe Customer
    const stripeCustomer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: {
        tenantId: tenant.id,
        userId: user.id,
        choicePlan: planType
      }
    })

    await prisma.tenant.update({
      where: { id: tenant.id },
      data: { stripeCustomerId: stripeCustomer.id }
    })

    // Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomer.id,
      mode: checkoutMode, // Aqui muda dinamicamente (payment ou subscription)
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/login?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cadastro?error=canceled`,
      metadata: {
        tenantId: tenant.id,
        choicePlan: planType
      }
    })

    if (!checkoutSession.url) throw new Error("Erro ao gerar link de pagamento.")
    redirectUrl = checkoutSession.url

  } catch (error: any) {
    console.error("Erro no cadastro:", error)
    return { error: error.message || "Erro ao processar cadastro." }
  }

  redirect(redirectUrl)
}