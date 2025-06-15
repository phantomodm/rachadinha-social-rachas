
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import WooCommerceRestApi from "https://esm.sh/@woocommerce/woocommerce-rest-api@1.0.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const log = (message: string, data?: any) => {
  console.log(`[update-woocommerce-order] ${message}`, data ? JSON.stringify(data, null, 2) : '');
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { payment_intent_id } = await req.json();
    log('Request received', { payment_intent_id });

    if (!payment_intent_id) {
      throw new Error("payment_intent_id is required.");
    }
    
    const STRIPE_KEY = Deno.env.get("STRIPE_SECRET_KEY");
    if (!STRIPE_KEY) {
      throw new Error("Stripe secret key is not set.");
    }
    const stripe = new Stripe(STRIPE_KEY, { apiVersion: "2023-10-16" });
    
    log('Retrieving payment intent from Stripe');
    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id, {
      expand: ['charges.data'],
    });
    const wooOrderId = paymentIntent.metadata.woocommerce_order_id;
    
    if (!wooOrderId) {
      throw new Error("WooCommerce Order ID not found in Payment Intent metadata.");
    }
    log('Found WooCommerce order ID in metadata', { wooOrderId });

    const WOO_URL = Deno.env.get("WOOCOMMERCE_STORE_URL");
    const WOO_KEY = Deno.env.get("WOOCOMMERCE_CONSUMER_KEY");
    const WOO_SECRET = Deno.env.get("WOOCOMMERCE_CONSUMER_SECRET");

    if (!WOO_URL || !WOO_KEY || !WOO_SECRET) {
      throw new Error("WooCommerce API credentials are not configured in Supabase secrets.");
    }

    const wooApi = new WooCommerceRestApi({
      url: WOO_URL,
      consumerKey: WOO_KEY,
      consumerSecret: WOO_SECRET,
      version: "wc/v3",
    });

    log('WooCommerce API initialized');

    const charge = paymentIntent.charges.data[0];
    const billingDetails = charge.billing_details;
    const updateData = {
      status: "processing",
      transaction_id: paymentIntent.id,
      billing: {
        first_name: billingDetails.name?.split(' ')[0] || '',
        last_name: billingDetails.name?.split(' ').slice(1).join(' ') || '',
        address_1: billingDetails.address?.line1 || '',
        address_2: billingDetails.address?.line2 || '',
        city: billingDetails.address?.city || '',
        state: billingDetails.address?.state || '',
        postcode: billingDetails.address?.postal_code || '',
        country: billingDetails.address?.country || '',
        email: billingDetails.email || charge.receipt_email || '',
        phone: billingDetails.phone || '',
      },
      shipping: {
        first_name: billingDetails.name?.split(' ')[0] || '',
        last_name: billingDetails.name?.split(' ').slice(1).join(' ') || '',
        address_1: billingDetails.address?.line1 || '',
        address_2: billingDetails.address?.line2 || '',
        city: billingDetails.address?.city || '',
        state: billingDetails.address?.state || '',
        postcode: billingDetails.address?.postal_code || '',
        country: billingDetails.address?.country || '',
      },
      set_paid: true,
    };

    log('Updating WooCommerce order', { wooOrderId, updateData });
    const response = await wooApi.put(`orders/${wooOrderId}`, updateData);
    
    if (response.status !== 200) {
      log('Error updating WooCommerce order', { status: response.status, data: response.data });
      throw new Error(`Failed to update WooCommerce order. Status: ${response.status}`);
    }

    log('Successfully updated WooCommerce order', { orderId: response.data.id });

    return new Response(JSON.stringify({ success: true, orderId: response.data.id }), {
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
