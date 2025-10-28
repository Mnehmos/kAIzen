// Supabase Edge Function: Send Welcome Email
// This function sends welcome emails to new subscribers

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? ''

serve(async (req) => {
  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get pending emails
    const { data: pendingEmails, error: fetchError } = await supabaseClient
      .from('email_logs')
      .select('*')
      .eq('status', 'pending')
      .eq('email_type', 'welcome')
      .limit(10)

    if (fetchError) {
      throw new Error(`Failed to fetch pending emails: ${fetchError.message}`)
    }

    if (!pendingEmails || pendingEmails.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No pending emails to send' }),
        { headers: { 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // Send each email
    const results = []
    for (const emailLog of pendingEmails) {
      try {
        // Send email via Resend API
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${RESEND_API_KEY}`
          },
          body: JSON.stringify({
            from: 'kAIzen Systems <newsletter@kaizen.systems>',
            to: [emailLog.email],
            subject: '🎉 Welcome to kAIzen Systems!',
            html: `
              <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #667eea;">Welcome to kAIzen Systems! 🎉</h1>
                
                <p>Thank you for subscribing to our newsletter on AI workflow optimization!</p>
                
                <p>You now have access to:</p>
                <ul>
                  <li><strong>Weekly Newsletter</strong> - Tested prompt engineering techniques</li>
                  <li><strong>Technique Library</strong> - Searchable, machine-readable specs</li>
                  <li><strong>Performance Benchmarks</strong> - Real-world data</li>
                </ul>
                
                <p>Our latest articles:</p>
                <ul>
                  <li>📝 <a href="https://mnehmos.github.io/kAIzen/newsletter.html">Standard Operating Procedures for Stateless Multi-Agent Systems</a></li>
                  <li>📝 <a href="https://mnehmos.github.io/kAIzen/newsletter.html">Self-Reflection Loop: Meta-Cognitive Quality Assurance</a></li>
                  <li>📝 <a href="https://mnehmos.github.io/kAIzen/newsletter.html">Hierarchical Task Decomposition</a></li>
                </ul>
                
                <p style="margin-top: 30px;">
                  <strong>Want full access?</strong><br>
                  <a href="https://mnehmos.github.io/kAIzen/pricing.html" style="display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 10px;">
                    Upgrade to Pro - $19/month
                  </a>
                </p>
                
                <p style="color: #666; font-size: 14px; margin-top: 40px;">
                  You're receiving this because you subscribed at kaizen.systems<br>
                  <a href="https://mnehmos.github.io/kAIzen/">Unsubscribe</a>
                </p>
              </div>
            `
          })
        })

        if (!res.ok) {
          const errorData = await res.text()
          throw new Error(`Resend API error: ${errorData}`)
        }

        // Mark as sent
        await supabaseClient
          .from('email_logs')
          .update({ 
            status: 'sent',
            metadata: { sent_at: new Date().toISOString() }
          })
          .eq('id', emailLog.id)

        results.push({ id: emailLog.id, status: 'sent', email: emailLog.email })
      } catch (error) {
        // Mark as failed
        await supabaseClient
          .from('email_logs')
          .update({ 
            status: 'failed',
            error_message: error.message
          })
          .eq('id', emailLog.id)

        results.push({ id: emailLog.id, status: 'failed', error: error.message })
      }
    }

    return new Response(
      JSON.stringify({ 
        message: `Processed ${results.length} emails`,
        results 
      }),
      { headers: { 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})