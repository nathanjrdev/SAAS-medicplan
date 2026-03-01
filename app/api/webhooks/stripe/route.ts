import { headers } from "next/headers"
import Stripe from "stripe"
import { prisma } from "@/lib/prisma"
import { stripe } from "@/lib/stripe"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const body = await req.text()
  const signature = (await headers()).get("Stripe-Signature") as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string
    )
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 })
  }

  const session = event.data.object as Stripe.Checkout.Session
  const subscription = event.data.object as Stripe.Subscription

  // ✅ CHECKOUT COMPLETO (Serve para Assinatura E Pagamento Único)
  if (event.type === "checkout.session.completed") {
    const tenantId = session.metadata?.tenantId
    const choicePlan = session.metadata?.choicePlan
    const customerId = session.customer as string
    
    // Se for vitalício, subscriptionId vem null, e tudo bem!
    const subscriptionId = typeof session.subscription === 'string' 
      ? session.subscription 
      : null

    if (tenantId && choicePlan) {
      await prisma.tenant.update({
        where: { id: tenantId },
        data: {
          plan: choicePlan, // "STANDARD", "PRO" ou "LIFETIME"
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId, // Grava null se for vitalício
        },
      })
      console.log(`✅ Tenant ${tenantId} ativado como ${choicePlan}`)
    }
  }

  // ❌ CANCELAMENTO (Só afeta quem tem assinatura)
  if (event.type === "customer.subscription.deleted") {
    const subscriptionId = subscription.id

    const tenant = await prisma.tenant.findUnique({
      where: { stripeSubscriptionId: subscriptionId }
    })

    // Se achou o tenant e ele NÃO é Vitalício (segurança extra), bloqueia
    if (tenant && tenant.plan !== 'LIFETIME') {
      await prisma.tenant.update({
        where: { id: tenant.id },
        data: { plan: "INACTIVE" }
      })
      console.log(`🚫 Tenant ${tenant.id} desativado.`)
    }
  }

  return new NextResponse(null, { status: 200 })
}