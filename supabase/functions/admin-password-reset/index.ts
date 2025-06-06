import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'npm:@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MANAGER_EMAILS = [
  'amy@straylite.com',
  'fred@replaymuseum.com',
  'play@replaymuseum.com',
  'brian@replaymuseum.com'
];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email, newPassword } = await req.json();

    // Validate input
    if (!email || !newPassword) {
      return new Response(
        JSON.stringify({ error: 'Email and new password are required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Check if email is a manager
    if (!MANAGER_EMAILS.includes(email)) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Only manager accounts can be reset' }),
        { 
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate environment variables
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const contactEmail = Deno.env.get('CONTACT_EMAIL');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!resendApiKey || !contactEmail || !supabaseUrl || !serviceRoleKey) {
      console.error('Missing required environment variables');
      return new Response(
        JSON.stringify({ 
          error: 'Service not properly configured. Please contact the administrator.' 
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Initialize Supabase admin client
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Get user by email
    const { data: user, error: getUserError } = await supabase.auth.admin.getUserByEmail(email);

    if (getUserError || !user) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Update user password
    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      password: newPassword
    });

    if (updateError) {
      console.error('Error updating password:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update password' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Send notification email using existing email system
    const emailContent = `
      <h3>Password Reset Notification</h3>
      <p>The password for your Replay Museum admin account has been successfully reset.</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>New Password:</strong> ${newPassword}</p>
      <p><strong>Reset Time:</strong> ${new Date().toLocaleString()}</p>
      
      <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <h4 style="margin: 0 0 8px 0; color: #374151;">Important Security Notes:</h4>
        <ul style="margin: 0; padding-left: 20px; color: #6b7280;">
          <li>Please change this password after your first login</li>
          <li>Use a strong, unique password for your account</li>
          <li>Do not share this password with anyone</li>
          <li>If you did not request this reset, contact the administrator immediately</li>
        </ul>
      </div>
      
      <p>You can now log in at: <a href="${Deno.env.get('SITE_URL') || 'https://your-site.com'}/login">${Deno.env.get('SITE_URL') || 'https://your-site.com'}/login</a></p>
    `;

    // Send email using Resend API (same system as contact forms)
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: Deno.env.get('CONTACT_FROM_EMAIL') || 'onboarding@resend.dev',
        to: email,
        subject: 'Replay Museum - Password Reset Confirmation',
        html: emailContent,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.text();
      console.error('Resend API error response:', errorData);
      // Don't fail the whole operation if email fails, password was already reset
      console.warn('Password was reset but notification email failed to send');
    }

    return new Response(
      JSON.stringify({ 
        message: 'Password reset successfully',
        email: email,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in password reset:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to reset password'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});