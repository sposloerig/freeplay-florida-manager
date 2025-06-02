import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Parse the request body
    const { email } = await req.json()

    // Validate email
    if (!email || !email.includes('@')) {
      return new Response(
        JSON.stringify({ error: 'Invalid email address' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Validate environment variables
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const newsletterEmail = Deno.env.get('NEWSLETTER_EMAIL');

    if (!resendApiKey || !newsletterEmail) {
      console.error('Missing required environment variables:', {
        hasResendApiKey: !!resendApiKey,
        hasNewsletterEmail: !!newsletterEmail
      });
      
      return new Response(
        JSON.stringify({ 
          error: 'Newsletter service not properly configured. Please contact the administrator.' 
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Send confirmation email
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: Deno.env.get('NEWSLETTER_FROM_EMAIL') || 'onboarding@resend.dev',
        to: email,
        subject: 'Welcome to Replay Museum Newsletter',
        html: `
          <h2>Thanks for subscribing!</h2>
          <p>You've been successfully added to our newsletter. You'll receive updates about:</p>
          <ul>
            <li>New game arrivals</li>
            <li>Special events and tournaments</li>
            <li>Exclusive promotions</li>
            <li>Museum news and updates</li>
          </ul>
          <p>Stay tuned for exciting news from Replay Museum!</p>
        `,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Resend API error response:', errorData);
      throw new Error(`Failed to send confirmation email: ${errorData}`);
    }

    const responseData = await response.json();
    console.log('Newsletter confirmation sent successfully:', responseData);
    
    return new Response(
      JSON.stringify({ message: 'Successfully subscribed to newsletter' }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error processing newsletter subscription:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to process newsletter subscription'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})