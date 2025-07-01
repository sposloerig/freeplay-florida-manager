import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// ElevenLabs API endpoints
const ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1";

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.split('/').pop();
    
    // Get the API key from the request headers
    const apiKey = req.headers.get('x-elevenlabs-api-key');
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "ElevenLabs API key is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the chatbot settings to retrieve the agent ID
    const { data: settings, error: settingsError } = await supabase
      .from('chatbot_settings')
      .select('agent_id')
      .limit(1)
      .single();

    if (settingsError) {
      return new Response(
        JSON.stringify({ error: "Failed to retrieve chatbot settings", details: settingsError.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const agentId = settings.agent_id;

    // Route handling based on path and method
    if (req.method === "GET") {
      if (path === "knowledge") {
        // Get knowledge base items
        const response = await fetch(
          `${ELEVENLABS_API_URL}/agents/${agentId}/knowledge`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "xi-api-key": apiKey,
            },
          }
        );

        const data = await response.json();
        
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else if (req.method === "POST") {
      if (path === "knowledge") {
        // Add knowledge base item
        const { title, text, type = "text" } = await req.json();
        
        if (!title || !text) {
          return new Response(
            JSON.stringify({ error: "Title and text are required" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        const response = await fetch(
          `${ELEVENLABS_API_URL}/agents/${agentId}/knowledge`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "xi-api-key": apiKey,
            },
            body: JSON.stringify({
              title,
              text,
              type,
            }),
          }
        );

        const data = await response.json();
        
        return new Response(JSON.stringify(data), {
          status: response.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else if (req.method === "DELETE") {
      if (path === "knowledge") {
        // Delete knowledge base item
        const { knowledge_id } = await req.json();
        
        if (!knowledge_id) {
          return new Response(
            JSON.stringify({ error: "Knowledge ID is required" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        const response = await fetch(
          `${ELEVENLABS_API_URL}/agents/${agentId}/knowledge/${knowledge_id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              "xi-api-key": apiKey,
            },
          }
        );

        // If successful, the response will be 204 No Content
        if (response.status === 204) {
          return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        } else {
          const errorData = await response.json();
          return new Response(JSON.stringify(errorData), {
            status: response.status,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }
    }

    // If we get here, the path or method is not supported
    return new Response(
      JSON.stringify({ error: "Not found" }),
      {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in elevenlabs-knowledge function:", error);
    
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});