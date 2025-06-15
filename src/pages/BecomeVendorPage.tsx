
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { loadStripe } from '@stripe/stripe-js';
import { Loader2 } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { getVendorByUserId } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

// IMPORTANT: Replace with your Stripe publishable key
const stripePromise = loadStripe("pk_test_YOUR_PUBLISHABLE_KEY"); 

const BecomeVendorPage = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null);

  const { data: vendor, isLoading: vendorLoading } = useQuery({
      queryKey: ['vendor', user?.id],
      queryFn: () => getVendorByUserId(user!.id),
      enabled: !!user,
  });

  const plans = [
    // IMPORTANT: Replace with your Stripe Price ID
    { name: 'Básico', price: 'R$29/mês', features: ['Listagem no app', 'Recebimento via PIX Rachadinha'], priceId: 'price_BASIC_PLAN_ID_PLACEHOLDER' },
    // IMPORTANT: Replace with your Stripe Price ID
    { name: 'Avançado', price: 'R$79/mês', features: ['Tudo do Básico', 'Cardápio Digital', 'Pedidos via WhatsApp'], priceId: 'price_ADVANCED_PLAN_ID_PLACEHOLDER' },
  ];

  const handleSubscribe = async (priceId: string) => {
    if (!user) {
      toast({ title: 'Erro', description: 'Você precisa estar logado para se inscrever.', variant: 'destructive' });
      return;
    }
    if (priceId.includes('PLACEHOLDER')) {
      toast({ title: 'Configuração necessária', description: 'Os Price IDs do Stripe ainda não foram configurados no código.', variant: 'destructive' });
      return;
    }

    setLoadingPriceId(priceId);

    try {
        const { data, error } = await supabase.functions.invoke('create-stripe-checkout-session', {
          body: { priceId: priceId, userId: user.id },
        });

        if (error) throw new Error(error.message);

        const stripe = await stripePromise;
        if (stripe && data.sessionId) {
          const { error: stripeError } = await stripe.redirectToCheckout({ sessionId: data.sessionId });
          if (stripeError) {
            throw new Error(stripeError.message);
          }
        }
    } catch (e: any) {
        toast({ title: 'Erro ao criar checkout', description: e.message, variant: 'destructive' });
    } finally {
        setLoadingPriceId(null);
    }
  };

  const isLoading = authLoading || vendorLoading;

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-grow flex justify-center items-center">
          <Loader2 className="h-16 w-16 animate-spin" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" />;
  }

  if(vendor && vendor.subscription_status === 'active') {
      return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8 text-center">
                <h1 className="text-2xl font-bold">Você já é um vendedor parceiro!</h1>
                <p className="text-muted-foreground mb-4">Gerencie sua conta e cardápio no seu painel.</p>
                <Button asChild>
                  {/* This will eventually lead to a vendor dashboard */}
                  <Link to="/vendor-onboarding">Ir para o painel</Link>
                </Button>
            </main>
        </div>
      )
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center">
            <h1 className="text-4xl font-extrabold text-primary mb-4">Torne-se um Vendedor Parceiro</h1>
            <p className="text-xl text-muted-foreground mb-12">Escolha o plano que melhor se adapta ao seu negócio.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <Card key={plan.name} className="flex flex-col">
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.price}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="list-disc list-inside space-y-2">
                  {plan.features.map(feature => <li key={feature}>{feature}</li>)}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={() => handleSubscribe(plan.priceId)}
                  disabled={loadingPriceId === plan.priceId}
                >
                  {loadingPriceId === plan.priceId ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Inscrever-se
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default BecomeVendorPage;
