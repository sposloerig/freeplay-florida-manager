import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface BuyerInquiryEmailRequest {
  game_id: string;
  game_name: string;
  buyer_name: string;
  buyer_email: string;
  buyer_phone?: string;
  offer_amount?: number;
  message: string;
  inquiry_type: 'purchase' | 'offer';
  owner_name?: string;
  owner_email?: string;
}

const MANAGER_EMAILS = [
  'brian@replaymuseum.com' // Update this to your Free Play Florida admin email
];

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
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY environment variable is not set');
    }

    // Parse request body
    const inquiryData: BuyerInquiryEmailRequest = await req.json();

    // Validate required fields
    if (!inquiryData.game_name || !inquiryData.buyer_name || !inquiryData.buyer_email || !inquiryData.message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Prepare email content
    const subject = `${inquiryData.inquiry_type === 'purchase' ? 'Purchase Request' : 'Offer'} for ${inquiryData.game_name}`;
    
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #333; margin: 0 0 10px 0;">New ${inquiryData.inquiry_type === 'purchase' ? 'Purchase Request' : 'Offer'}</h2>
          <p style="color: #666; margin: 0;">From Free Play Florida Marketplace</p>
        </div>
        
        <div style="background-color: #e3f2fd; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #1976d2; margin: 0 0 10px 0;">Game: ${inquiryData.game_name}</h3>
          ${inquiryData.offer_amount ? `<p style="color: #1976d2; margin: 0; font-weight: bold;">Offer Amount: $${inquiryData.offer_amount.toLocaleString()}</p>` : ''}
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #333; margin: 0 0 15px 0;">Buyer Information</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold; width: 120px;">Name:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${inquiryData.buyer_name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">Email:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee;">
                <a href="mailto:${inquiryData.buyer_email}" style="color: #1976d2; text-decoration: none;">${inquiryData.buyer_email}</a>
              </td>
            </tr>
            ${inquiryData.buyer_phone ? `
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">Phone:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee;">
                <a href="tel:${inquiryData.buyer_phone}" style="color: #1976d2; text-decoration: none;">${inquiryData.buyer_phone}</a>
              </td>
            </tr>
            ` : ''}
          </table>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #333; margin: 0 0 15px 0;">Message</h3>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #1976d2;">
            <p style="margin: 0; line-height: 1.6; color: #333;">${inquiryData.message.replace(/\n/g, '<br>')}</p>
          </div>
        </div>
        
        <div style="background-color: #e8f5e8; padding: 15px; border-radius: 8px; border-left: 4px solid #28a745;">
          <p style="margin: 0 0 10px 0; color: #155724; font-size: 14px;">
            <strong>Next Steps:</strong> You can respond directly to the buyer using their contact information above.
          </p>
          <p style="margin: 0; color: #155724; font-size: 14px;">
            This inquiry has been logged with Free Play Florida for record-keeping purposes.
          </p>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
          <p style="color: #666; font-size: 12px; margin: 0;">
            This email was sent from the Free Play Florida marketplace system.
          </p>
        </div>
      </div>
    `;

    // Prepare recipient list: owner + admin for logging
    const recipients = [];
    
    // Add owner email if provided
    if (inquiryData.owner_email) {
      recipients.push({
        email: inquiryData.owner_email,
        type: 'owner',
        name: inquiryData.owner_name || 'Game Owner'
      });
    }
    
    // Add admin emails for logging
    MANAGER_EMAILS.forEach(email => {
      recipients.push({
        email: email,
        type: 'admin',
        name: 'Free Play Florida Admin'
      });
    });

    // Send emails to all recipients
    const emailPromises = recipients.map(async (recipient) => {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Free Play Florida <noreply@freeplayflorida.com>',
          to: recipient.email,
          subject: recipient.type === 'owner' ? subject : `[ADMIN LOG] ${subject}`,
          html: emailHtml,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to send email to ${recipient.email}: ${errorText}`);
      }

      return response.json();
    });

    // Wait for all emails to be sent
    const emailResults = await Promise.all(emailPromises);

    console.log('Buyer inquiry emails sent successfully:', emailResults);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Buyer inquiry emails sent successfully',
        emailIds: emailResults.map(result => result.id)
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error sending buyer inquiry emails:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return new Response(
      JSON.stringify({ 
        error: `Failed to send buyer inquiry emails: ${errorMessage}` 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}); 