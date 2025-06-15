
import { useState, useEffect } from 'react';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/hooks/useCart';
import CheckoutForm from '@/components/CheckoutForm';
import Header from '@/components/Header';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

const stripePromise = loadStripe("pk_test_YOUR_PUBLISHABLE_KEY"); // IMPORTANT: Replace with your Stripe publishable key

const CheckoutPage = () => {
  const [clientSecret, setClientSecret] = useState('');
  const { totalPrice, cartItems } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    if (totalPrice > 0) {
      supabase.functions.invoke('create-payment-intent', {
        body: { amount: totalPrice }
      }).then(({ data, error }) => {
        if (error) {
          console.error(error);
          toast({
            title: "Erro",
            description: "Não foi possível iniciar o checkout. Verifique se a chave secreta do Stripe está configurada.",
            variant: "destructive",
          });
        }
        if (data?.clientSecret) {
          setClientSecret(data.clientSecret);
        }
      });
    }
  }, [totalPrice, toast]);

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe',
    },
  };

  if (cartItems.length === 0) {
      return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8 text-center">
                <h1 className="text-2xl font-bold">Seu carrinho está vazio.</h1>
                <p className="text-muted-foreground mb-4">Adicione items ao seu carrinho antes de ir para o checkout.</p>
                <Button asChild>
                  <Link to="/store">Voltar para a loja</Link>
                </Button>
            </main>
        </div>
      )
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-extrabold text-primary mb-6">Checkout</h1>
        {clientSecret ? (
          <Elements options={options} stripe={stripePromise}>
            <CheckoutForm />
          </Elements>
        ) : (
          <p>Carregando formulário de pagamento...</p>
        )}
      </main>
    </div>
  );
};

export default CheckoutPage;
