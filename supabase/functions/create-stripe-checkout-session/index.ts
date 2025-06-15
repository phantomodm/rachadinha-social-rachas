
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const log = (message: string, data?: any) => {
  console.log(`[create-stripe-checkout-session] ${message}`, data ? JSON.stringify(data, null, 2) : '');
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { priceId, userId } = await req.json();
    log('Request received', { priceId, userId });

    if (!priceId || !userId) {
      throw new Error("Price ID and User ID are required.");
    }

    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      log('Stripe secret key not set');
      throw new Error("Stripe secret key is not set in Supabase secrets.");
    }
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      log('Supabase secrets not set');
      throw new Error("Supabase URL or Service Role Key is not set.");
    }
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
    if(userError) {
        log('Error fetching user', userError);
        throw userError;
    }
    
    const { data: vendor, error: vendorError } = await supabaseAdmin
        .from('vendors')
        .select('stripe_customer_id')
        .eq('user_id', userId)
        .maybeSingle();
    
    if(vendorError) {
        log('Error fetching vendor', vendorError);
        throw vendorError;
    }

    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2023-10-16" });

    let customerId = vendor?.stripe_customer_id;

    if (!customerId) {
        log('Creating new Stripe customer');
        const customer = await stripe.customers.create({ 
            email: user.email,
            name: user.email,
            metadata: { supabase_user_id: userId }
        });
        customerId = customer.id;
        log('Stripe customer created', { customerId });
    } else {
        log('Using existing Stripe customer', { customerId });
    }

    const siteUrl = Deno.env.get("SITE_URL") || 'http://localhost:5173';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer: customerId,
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      success_url: `${siteUrl}/vendor-onboarding`,
      cancel_url: `${siteUrl}/become-vendor`,
      subscription_data: {
          metadata: {
              supabase_user_id: userId
          }
      },
      metadata: {
          supabase_user_id: userId
      }
    });
    
    log('Stripe checkout session created', { sessionId: session.id });

    return new Response(JSON.stringify({ sessionId: session.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    log('Error caught', { message: error.message });
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
