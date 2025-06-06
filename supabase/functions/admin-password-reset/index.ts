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

    console.log('Password reset request received for:', email);

    // Validate input
    if (!email || !newPassword) {
      console.error('Missing required fields:', { hasEmail: !!email, hasPassword: !!newPassword });
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
      console.error('Unauthorized email attempt:', email);
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const fromEmail = Deno.env.get('CONTACT_FROM_EMAIL') || 'noreply@replaymuseum.com';

    console.log('Environment check:', {
      hasResendApiKey: !!resendApiKey,
      hasSupabaseUrl: !!supabaseUrl,
      hasServiceRoleKey: !!serviceRoleKey,
      fromEmail: fromEmail,
      resendKeyLength: resendApiKey?.length || 0
    });

    if (!resendApiKey || !supabaseUrl || !serviceRoleKey) {
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

    console.log('Looking up user by email:', email);

    // Get user by email
    const { data: userData, error: getUserError } = await supabase.auth.admin.listUsers();

    if (getUserError) {
      console.error('Error listing users:', getUserError);
      return new Response(
        JSON.stringify({ error: 'Failed to lookup user' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Find the user with matching email
    const user = userData.users.find(u => u.email === email);

    if (!user) {
      console.error('User not found:', email);
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Found user:', { id: user.id, email: user.email });

    // Update user password
    console.log('Updating password for user:', user.id);
    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      password: newPassword
    });

    if (updateError) {
      console.error('Error updating password:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update password: ' + updateError.message }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Password updated successfully, sending notification email');

    // Create comprehensive email content
    const emailContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset Confirmation - Replay Museum</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
          .password-box { background: #e9ecef; padding: 15px; border-radius: 5px; font-family: monospace; font-size: 16px; font-weight: bold; text-align: center; margin: 20px 0; border: 2px solid #6c757d; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .security-tips { background: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset Successful</h1>
            <p>Replay Museum Admin Portal</p>
          </div>
          
          <div class="content">
            <h2>Your Password Has Been Reset</h2>
            <p>Hello,</p>
            <p>Your Replay Museum admin account password has been successfully reset by an administrator.</p>
            
            <p><strong>Account Email:</strong> ${email}</p>
            <p><strong>Reset Time:</strong> ${new Date().toLocaleString('en-US', { 
              timeZone: 'America/New_York',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              timeZoneName: 'short'
            })}</p>
            
            <h3>Your New Temporary Password:</h3>
            <div class="password-box">
              ${newPassword}
            </div>
            
            <div style="text-align: center;">
              <a href="${Deno.env.get('SITE_URL') || 'https://replaymuseum.com'}/login" class="button">
                Login to Your Account
              </a>
            </div>
            
            <div class="warning">
              <h4>⚠️ Important Security Notice:</h4>
              <ul>
                <li><strong>Change this password immediately</strong> after your first login</li>
                <li>This is a temporary password - do not use it permanently</li>
                <li>Do not share this password with anyone</li>
                <li>If you did not request this reset, contact the administrator immediately</li>
              </ul>
            </div>
            
            <div class="security-tips">
              <h4>🛡️ Password Security Tips:</h4>
              <ul>
                <li>Use a unique password that you don't use elsewhere</li>
                <li>Include uppercase, lowercase, numbers, and special characters</li>
                <li>Make it at least 12 characters long</li>
                <li>Consider using a password manager</li>
                <li>Never share your password via email or text</li>
              </ul>
            </div>
            
            <p>If you have any questions or need assistance, please contact your system administrator.</p>
            
            <p>Best regards,<br>
            The Replay Museum Team</p>
          </div>
          
          <div class="footer">
            <p>This email was sent to ${email}</p>
            <p>Replay Museum | 119 East Tarpon Avenue, Tarpon Springs, FL</p>
            <p>This is an automated message - please do not reply to this email</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email using Resend API
    console.log('Sending email to:', email, 'from:', fromEmail);
    
    const emailPayload = {
      from: fromEmail,
      to: email,
      subject: '🔐 Replay Museum - Password Reset Confirmation',
      html: emailContent,
      reply_to: 'noreply@replaymuseum.com'
    };

    console.log('Email payload:', {
      from: emailPayload.from,
      to: emailPayload.to,
      subject: emailPayload.subject,
      hasHtml: !!emailPayload.html
    });

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    });

    const emailResponseText = await emailResponse.text();
    console.log('Resend API response:', {
      status: emailResponse.status,
      statusText: emailResponse.statusText,
      headers: Object.fromEntries(emailResponse.headers.entries()),
      body: emailResponseText
    });

    if (!emailResponse.ok) {
      console.error('Resend API error:', emailResponseText);
      // Don't fail the whole operation if email fails, password was already reset
      console.warn('Password was reset but notification email failed to send');
      
      return new Response(
        JSON.stringify({ 
          message: 'Password reset successfully, but email notification failed',
          email: email,
          timestamp: new Date().toISOString(),
          warning: 'Email delivery failed - please notify user manually',
          emailError: emailResponseText
        }),
        { 
          status: 200, // Still success since password was reset
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const emailResponseData = JSON.parse(emailResponseText);
    console.log('Email sent successfully:', emailResponseData);

    return new Response(
      JSON.stringify({ 
        message: 'Password reset successfully and notification email sent',
        email: email,
        timestamp: new Date().toISOString(),
        emailId: emailResponseData.id
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in password reset function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to reset password',
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});