import { createClient } from 'npm:@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const adminEmails = [
  'amy@straylite.com',
  'fred@replaymuseum.com',
  'play@replaymuseum.com',
  'brian@replaymuseum.com'
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing environment variables');
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const newPassword = 'ReplayMuseum2025!'; // Temporary secure password
    const results = [];

    for (const email of adminEmails) {
      try {
        const { data: user, error: getUserError } = await supabase
          .auth
          .admin
          .getUserByEmail(email);

        if (getUserError) throw getUserError;

        if (!user?.id) {
          results.push({ email, status: 'error', message: 'User not found' });
          continue;
        }

        const { error: updateError } = await supabase
          .auth
          .admin
          .updateUserById(user.id, { password: newPassword });

        if (updateError) throw updateError;

        results.push({ email, status: 'success', message: 'Password updated' });
      } catch (err) {
        results.push({ 
          email, 
          status: 'error', 
          message: err instanceof Error ? err.message : 'Unknown error'
        });
      }
    }

    return new Response(
      JSON.stringify({
        message: 'Password update complete',
        results,
        newPassword
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : 'An error occurred'
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