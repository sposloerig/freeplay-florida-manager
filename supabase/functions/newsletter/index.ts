import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { SmtpClient } from "npm:nodemailer";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Initialize SMTP transport
    const transport = new SmtpClient({
      host: Deno.env.get('SMTP_HOST'),
      port: Number(Deno.env.get('SMTP_PORT')),
      secure: true,
      auth: {
        user: Deno.env.get('SMTP_USER'),
        pass: Deno.env.get('SMTP_PASS'),
      },
    });

    // Send confirmation email
    await transport.sendMail({
      from: `"Replay Museum" <${Deno.env.get('SMTP_FROM')}>`,
      to: email,
      subject: 'Welcome to Replay Museum Newsletter!',
      text: `Thank you for subscribing to our newsletter!\n\nYou'll now receive updates about new events, tournaments, and special promotions at Replay Museum.\n\nBest regards,\nThe Replay Museum Team`,
      html: `
        <h2>Welcome to Replay Museum Newsletter!</h2>
        <p>Thank you for subscribing to our newsletter!</p>
        <p>You'll now receive updates about:</p>
        <ul>
          <li>New events and tournaments</li>
          <li>Special promotions</li>
          <li>Museum news and updates</li>
        </ul>
        <p>Best regards,<br>The Replay Museum Team</p>
      `,
    });

    // Also send notification to admin
    await transport.sendMail({
      from: `"Newsletter Signup" <${Deno.env.get('SMTP_FROM')}>`,
      to: Deno.env.get('ADMIN_EMAIL'),
      subject: 'New Newsletter Subscription',
      text: `New newsletter subscription: ${email}`,
    });

    return new Response(
      JSON.stringify({ message: 'Successfully subscribed to newsletter' }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error processing newsletter signup:', error);
    
    return new Response(
      JSON.stringify({ error: 'Failed to process subscription' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});