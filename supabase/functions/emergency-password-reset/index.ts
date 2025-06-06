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
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const fromEmail = Deno.env.get('CONTACT_FROM_EMAIL') || 'noreply@replaymuseum.com';

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Generate a strong temporary password
    const generateSecurePassword = () => {
      const length = 16;
      const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
      let password = "";
      
      // Ensure at least one of each required character type
      password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)]; // uppercase
      password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)]; // lowercase
      password += "0123456789"[Math.floor(Math.random() * 10)]; // number
      password += "!@#$%^&*"[Math.floor(Math.random() * 8)]; // special char
      
      // Fill the rest randomly
      for (let i = 4; i < length; i++) {
        password += charset[Math.floor(Math.random() * charset.length)];
      }
      
      // Shuffle the password
      return password.split('').sort(() => Math.random() - 0.5).join('');
    };

    const results = [];
    const newPassword = generateSecurePassword();

    console.log('Starting emergency password reset for all admin accounts...');

    // Get all users
    const { data: userData, error: getUserError } = await supabase.auth.admin.listUsers();

    if (getUserError) {
      throw getUserError;
    }

    for (const email of MANAGER_EMAILS) {
      try {
        console.log(`Processing ${email}...`);

        // Find the user with matching email
        const user = userData.users.find(u => u.email === email);

        if (!user) {
          results.push({ 
            email, 
            status: 'error', 
            message: 'User not found' 
          });
          continue;
        }

        // Update user password
        const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
          password: newPassword
        });

        if (updateError) {
          throw updateError;
        }

        console.log(`Password updated for ${email}`);

        // Send email notification if Resend is configured
        if (resendApiKey) {
          try {
            const emailContent = `
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="utf-8">
                <title>URGENT: Password Reset - Replay Museum</title>
                <style>
                  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                  .header { background: #dc3545; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                  .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
                  .password-box { background: #e9ecef; padding: 15px; border-radius: 5px; font-family: monospace; font-size: 18px; font-weight: bold; text-align: center; margin: 20px 0; border: 2px solid #dc3545; }
                  .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
                  .button { display: inline-block; background: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h1>🚨 URGENT: Security Password Reset</h1>
                    <p>Replay Museum Admin Portal</p>
                  </div>
                  
                  <div class="content">
                    <h2>Emergency Password Reset Completed</h2>
                    <p><strong>URGENT:</strong> Your admin account password has been reset for security reasons.</p>
                    
                    <p><strong>Account:</strong> ${email}</p>
                    <p><strong>Reset Time:</strong> ${new Date().toLocaleString()}</p>
                    
                    <h3>Your New Temporary Password:</h3>
                    <div class="password-box">
                      ${newPassword}
                    </div>
                    
                    <div style="text-align: center;">
                      <a href="${Deno.env.get('SITE_URL') || 'https://replaymuseum.com'}/login" class="button">
                        Login Now
                      </a>
                    </div>
                    
                    <div class="warning">
                      <h4>⚠️ CRITICAL SECURITY ACTIONS REQUIRED:</h4>
                      <ol>
                        <li><strong>Login immediately</strong> with the password above</li>
                        <li><strong>Change this password</strong> to something only you know</li>
                        <li><strong>Do not share</strong> this password with anyone</li>
                        <li><strong>Delete this email</strong> after changing your password</li>
                      </ol>
                    </div>
                    
                    <p><strong>Why was this done?</strong> This emergency reset was performed to secure all admin accounts due to a potential security concern.</p>
                    
                    <p>If you have any questions, contact the system administrator immediately.</p>
                  </div>
                </div>
              </body>
              </html>
            `;

            const emailResponse = await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${resendApiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                from: fromEmail,
                to: email,
                subject: '🚨 URGENT: Emergency Password Reset - Replay Museum',
                html: emailContent,
                reply_to: 'noreply@replaymuseum.com'
              }),
            });

            if (emailResponse.ok) {
              console.log(`Email sent to ${email}`);
              results.push({ 
                email, 
                status: 'success', 
                message: 'Password reset and email sent',
                emailSent: true
              });
            } else {
              console.warn(`Email failed for ${email}`);
              results.push({ 
                email, 
                status: 'success', 
                message: 'Password reset but email failed',
                emailSent: false
              });
            }
          } catch (emailError) {
            console.error(`Email error for ${email}:`, emailError);
            results.push({ 
              email, 
              status: 'success', 
              message: 'Password reset but email failed',
              emailSent: false
            });
          }
        } else {
          results.push({ 
            email, 
            status: 'success', 
            message: 'Password reset (no email service configured)',
            emailSent: false
          });
        }

      } catch (err) {
        console.error(`Error processing ${email}:`, err);
        results.push({ 
          email, 
          status: 'error', 
          message: err instanceof Error ? err.message : 'Unknown error'
        });
      }
    }

    return new Response(
      JSON.stringify({
        message: 'Emergency password reset completed',
        newPassword: newPassword,
        timestamp: new Date().toISOString(),
        results: results,
        summary: {
          total: MANAGER_EMAILS.length,
          successful: results.filter(r => r.status === 'success').length,
          failed: results.filter(r => r.status === 'error').length,
          emailsSent: results.filter(r => r.emailSent === true).length
        }
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (err) {
    console.error('Emergency password reset error:', err);
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : 'Emergency password reset failed',
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});