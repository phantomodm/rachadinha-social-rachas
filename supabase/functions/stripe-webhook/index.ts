
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const log = (message: string, data?: any) => {
  console.log(`[stripe-webhook] ${message}`, data ? JSON.stringify(data, null, 2) : '');
}

serve(async (req: Request) => {
  const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SIGNING_SECRET");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!stripeSecretKey || !webhookSecret || !supabaseUrl || !supabaseServiceKey) {
      log('Missing required environment variables');
      return new Response("Internal Server Error: Missing configuration", { status: 500 });
  }

  const stripe = new Stripe(stripeSecretKey, { apiVersion: "2023-10-16" });
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

  const signature = req.headers.get("stripe-signature");
  const body = await req.text();

  let event: Stripe.Event;

  try {
    event = await stripe.webhooks.constructEvent(body, signature!, webhookSecret);
    log('Webhook event received', { type: event.type });
  } catch (err) {
    log('Webhook signature verification failed', { error: err.message });
    return new Response(err.message, { status: 400 });
  }

  try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          
          if (session.mode === 'subscription') {
            const subscriptionId = session.subscription as string;
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            
            const userId = session.metadata?.supabase_user_id || subscription.metadata.supabase_user_id;
            if (!userId) {
                log('CRITICAL: supabase_user_id not found in session or subscription metadata.');
                break;
            }

            const vendorData = {
                user_id: userId,
                stripe_customer_id: session.customer as string,
                subscription_id: subscription.id,
                subscription_status: subscription.status,
                subscription_tier: subscription.items.data[0]?.price.id,
                subscription_ends_at: new Date(subscription.current_period_end * 1000).toISOString(),
            };

            log('Upserting vendor data from checkout session', vendorData);
            const { error } = await supabaseAdmin.from('vendors').upsert(vendorData, { onConflict: 'user_id' });
            if (error) log('Error upserting vendor', error);
          }
          break;
        }
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted': {
            const subscription = event.data.object as Stripe.Subscription;
            const { error } = await supabaseAdmin
                .from('vendors')
                .update({
                    subscription_status: subscription.status,
                    subscription_ends_at: new Date(subscription.current_period_end * 1000).toISOString(),
                    subscription_tier: subscription.items.data[0]?.price.id,
                })
                .eq('subscription_id', subscription.id);
            if (error) log('Error updating subscription', error);
            break;
        }
        default:
          log(`Unhandled event type ${event.type}`);
      }
  } catch(e) {
      log('Error handling webhook event', { error: e.message });
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
});
