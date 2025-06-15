
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import WooCommerceRestApi from "https://esm.sh/@woocommerce/woocommerce-rest-api@1.0.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const log = (message: string, data?: any) => {
  console.log(`[create-payment-intent] ${message}`, data ? JSON.stringify(data, null, 2) : '');
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { amount, items } = await req.json();
    log('Request received', { amount, itemCount: items?.length });

    if (!items || items.length === 0) {
      throw new Error("Cart items are required to create an order.");
    }
    
    const WOO_URL = Deno.env.get("WOOCOMMERCE_STORE_URL");
    const WOO_KEY = Deno.env.get("WOOCOMMERCE_CONSUMER_KEY");
    const WOO_SECRET = Deno.env.get("WOOCOMMERCE_CONSUMER_SECRET");

    if (!WOO_URL || !WOO_KEY || !WOO_SECRET) {
      log('WooCommerce secrets are not set');
      throw new Error("WooCommerce API credentials are not configured in Supabase secrets.");
    }

    const wooApi = new WooCommerceRestApi({
      url: WOO_URL,
      consumerKey: WOO_KEY,
      consumerSecret: WOO_SECRET,
      version: "wc/v3",
    });
    
    log('WooCommerce API initialized');

    const line_items = items.map((item: any) => ({
      product_id: item.id,
      quantity: item.quantity,
    }));

    const wooOrderData = {
      payment_method: "stripe",
      payment_method_title: "Cartão de Crédito (Stripe)",
      status: "pending",
      line_items: line_items,
    };
    
    log('Creating WooCommerce order with data:', wooOrderData);
    const wooOrderResponse = await wooApi.post("orders", wooOrderData);
    
    if (wooOrderResponse.status !== 201) {
      log('Error creating WooCommerce order', { status: wooOrderResponse.status, data: wooOrderResponse.data });
      throw new Error(`Failed to create WooCommerce order. Status: ${wooOrderResponse.status}`);
    }
    
    const wooOrder = wooOrderResponse.data;
    log('WooCommerce order created', { orderId: wooOrder.id, total: wooOrder.total });

    const wooTotal = parseFloat(wooOrder.total);
    if (wooTotal !== amount) {
      log('Total mismatch', { clientTotal: amount, wooTotal: wooTotal });
      await wooApi.put(`orders/${wooOrder.id}`, { status: 'cancelled' });
      log('Cancelled WooCommerce order due to amount mismatch', { orderId: wooOrder.id });
      throw new Error(`Total price mismatch. Cart total is ${amount}, but WooCommerce calculated ${wooTotal}.`);
    }
    
    log('Totals match. Proceeding with Stripe payment intent.');

    if (!Deno.env.get("STRIPE_SECRET_KEY")) {
      throw new Error("Stripe secret key is not set.");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2023-10-16",
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'brl',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        woocommerce_order_id: wooOrder.id,
      },
    });

    log('Stripe Payment Intent created', { paymentIntentId: paymentIntent.id });

    return new Response(JSON.stringify({ clientSecret: paymentIntent.client_secret }), {
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
