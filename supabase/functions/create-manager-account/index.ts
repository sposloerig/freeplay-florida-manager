import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface CreateManagerRequest {
  email: string;
  password: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    // Initialize Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Parse request body
    const { email, password }: CreateManagerRequest = await req.json();

    // Validate input
    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email and password are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate password strength
    const passwordErrors = [];
    if (password.length < 8) passwordErrors.push('at least 8 characters');
    if (!/[A-Z]/.test(password)) passwordErrors.push('one uppercase letter');
    if (!/[a-z]/.test(password)) passwordErrors.push('one lowercase letter');
    if (!/\d/.test(password)) passwordErrors.push('one number');
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) passwordErrors.push('one special character');

    if (passwordErrors.length > 0) {
      return new Response(
        JSON.stringify({ 
          error: `Password must contain ${passwordErrors.join(', ')}` 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check if user already exists using listUsers with email filter
    const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers({
      filter: `email.eq.${email}`
    });
    
    if (listError) {
      console.error('Error checking for existing user:', listError);
      return new Response(
        JSON.stringify({ error: `Failed to check existing users: ${listError.message}` }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (existingUsers.users && existingUsers.users.length > 0) {
      return new Response(
        JSON.stringify({ error: 'User account already exists for this email' }),
        { 
          status: 409, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create the user account
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email for admin-created accounts
    });

    if (createError) {
      console.error('Error creating user:', createError);
      return new Response(
        JSON.stringify({ error: `Failed to create user: ${createError.message}` }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!newUser.user) {
      return new Response(
        JSON.stringify({ error: 'Failed to create user account' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Successfully created user account for ${email}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `User account created successfully for ${email}`,
        userId: newUser.user.id
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error in create-manager-account function:', error);
    
    // Include the actual error message in the response for better debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return new Response(
      JSON.stringify({ 
        error: `Internal server error: ${errorMessage}` 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});