// Stripe Webhook Handler for kAIzen Systems
// Handles successful payment events and upgrades users to Pro tier

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@11.1.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

  if (!signature || !webhookSecret) {
    console.error('Missing signature or webhook secret')
    return new Response('Webhook signature or secret missing', { status: 400 })
  }

  try {
    const body = await req.text()
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)

    console.log(`Received Stripe event: ${event.type}`)

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(session)
        break
      }
      
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionChange(subscription, 'active')
        break
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionChange(subscription, 'cancelled')
        break
      }
      
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentSucceeded(invoice)
        break
      }
      
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentFailed(invoice)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (err) {
    console.error('Webhook error:', err.message)
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }
})

// Handle completed checkout session
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  
  const customerEmail = session.customer_email || session.customer_details?.email
  const customerId = session.customer as string

  if (!customerEmail) {
    console.error('No customer email in checkout session')
    return
  }

  console.log(`Processing checkout for: ${customerEmail}`)

  try {
    // Update subscriber to Pro tier
    const { data, error } = await supabase
      .from('subscribers')
      .update({
        tier: 'pro',
        stripe_customer_id: customerId,
        metadata: {
          stripe_session_id: session.id,
          upgraded_at: new Date().toISOString()
        }
      })
      .eq('email', customerEmail)
      .select()

    if (error) {
      console.error('Error updating subscriber:', error)
      return
    }

    if (data && data.length > 0) {
      console.log(`✓ Upgraded ${customerEmail} to Pro tier`)
    } else {
      // If subscriber doesn't exist, create one
      const { error: insertError } = await supabase
        .from('subscribers')
        .insert({
          email: customerEmail,
          tier: 'pro',
          stripe_customer_id: customerId,
          subscribed_at: new Date().toISOString(),
          metadata: {
            stripe_session_id: session.id,
            upgraded_at: new Date().toISOString()
          }
        })

      if (insertError) {
        console.error('Error creating Pro subscriber:', insertError)
      } else {
        console.log(`✓ Created new Pro subscriber: ${customerEmail}`)
      }
    }
  } catch (err) {
    console.error('Error in handleCheckoutCompleted:', err)
  }
}

// Handle subscription changes
async function handleSubscriptionChange(subscription: Stripe.Subscription, status: string) {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  
  const customerId = subscription.customer as string
  const tier = status === 'active' ? 'pro' : 'free'

  console.log(`Processing subscription change for customer: ${customerId}, status: ${status}`)

  try {
    const { data, error } = await supabase
      .from('subscribers')
      .update({
        tier: tier,
        metadata: {
          subscription_id: subscription.id,
          subscription_status: status,
          updated_at: new Date().toISOString()
        }
      })
      .eq('stripe_customer_id', customerId)
      .select()

    if (error) {
      console.error('Error updating subscription:', error)
      return
    }

    if (data && data.length > 0) {
      console.log(`✓ Updated subscription for customer ${customerId} to ${tier}`)
    }
  } catch (err) {
    console.error('Error in handleSubscriptionChange:', err)
  }
}

// Handle successful payment
async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  
  const customerId = invoice.customer as string

  console.log(`Payment succeeded for customer: ${customerId}`)

  try {
    // Ensure customer is still on Pro tier
    const { error } = await supabase
      .from('subscribers')
      .update({
        tier: 'pro',
        metadata: {
          last_payment_at: new Date().toISOString(),
          last_invoice_id: invoice.id
        }
      })
      .eq('stripe_customer_id', customerId)

    if (error) {
      console.error('Error updating payment record:', error)
    } else {
      console.log(`✓ Confirmed Pro status for customer ${customerId}`)
    }
  } catch (err) {
    console.error('Error in handlePaymentSucceeded:', err)
  }
}

// Handle failed payment
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  
  const customerId = invoice.customer as string

  console.log(`Payment failed for customer: ${customerId}`)

  try {
    // Optionally downgrade to free tier after payment failure
    // For now, just log it - you might want grace period logic here
    const { error } = await supabase
      .from('subscribers')
      .update({
        metadata: {
          payment_failed_at: new Date().toISOString(),
          failed_invoice_id: invoice.id
        }
      })
      .eq('stripe_customer_id', customerId)

    if (error) {
      console.error('Error recording payment failure:', error)
    } else {
      console.log(`✓ Recorded payment failure for customer ${customerId}`)
    }
  } catch (err) {
    console.error('Error in handlePaymentFailed:', err)
  }
}