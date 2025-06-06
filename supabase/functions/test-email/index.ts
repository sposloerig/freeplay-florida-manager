import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Check environment variables
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const contactEmail = Deno.env.get('CONTACT_EMAIL');
    const fromEmail = Deno.env.get('CONTACT_FROM_EMAIL');

    console.log('Environment check:', {
      hasResendApiKey: !!resendApiKey,
      hasContactEmail: !!contactEmail,
      hasFromEmail: !!fromEmail,
      resendKeyLength: resendApiKey?.length || 0
    });

    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not found');
    }

    if (!contactEmail) {
      throw new Error('CONTACT_EMAIL not found');
    }

    // Test email
    const emailData = {
      from: fromEmail || 'onboarding@resend.dev',
      to: contactEmail,
      subject: 'Test Email from Supabase Edge Function',
      html: `
        <h2>Test Email</h2>
        <p>This is a test email sent at ${new Date().toISOString()}</p>
        <p>If you receive this, the email system is working correctly.</p>
      `
    };

    console.log('Sending test email with data:', {
      from: emailData.from,
      to: emailData.to,
      subject: emailData.subject
    });

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    const responseText = await response.text();
    console.log('Resend API response:', {
      status: response.status,
      statusText: response.statusText,
      body: responseText
    });

    if (!response.ok) {
      throw new Error(`Resend API error: ${response.status} - ${responseText}`);
    }

    const responseData = JSON.parse(responseText);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Test email sent successfully',
        emailId: responseData.id,
        timestamp: new Date().toISOString(),
        environment: {
          hasResendApiKey: !!resendApiKey,
          hasContactEmail: !!contactEmail,
          hasFromEmail: !!fromEmail
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Test email error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});