
import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, useStripe } from '@stripe/react-stripe-js';
import { useCart } from '@/hooks/useCart';
import Header from '@/components/Header';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

const stripePromise = loadStripe("pk_test_YOUR_PUBLISHABLE_KEY"); // IMPORTANT: Replace with your Stripe publishable key

const OrderConfirmationContent = () => {
    const stripe = useStripe();
    const { clearCart } = useCart();
    const [message, setMessage] = useState<string | null>(null);
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

    useEffect(() => {
        if (!stripe) {
            return;
        }

        const clientSecret = new URLSearchParams(window.location.search).get(
            'payment_intent_client_secret'
        );

        if (!clientSecret) {
            setStatus('error');
            setMessage('Algo deu errado. Segredo do cliente não encontrado.');
            return;
        }

        stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
            switch (paymentIntent?.status) {
                case 'succeeded':
                    setMessage('Pagamento bem-sucedido!');
                    setStatus('success');
                    clearCart();
                    break;
                case 'processing':
                    setMessage("Seu pagamento está processando.");
                    setStatus('loading');
                    break;
                case 'requires_payment_method':
                    setMessage("Seu pagamento não foi bem-sucedido, por favor, tente novamente.");
                    setStatus('error');
                    break;
                default:
                    setMessage('Algo deu errado.');
                    setStatus('error');
                    break;
            }
        });
    }, [stripe, clearCart]);

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8 text-center flex flex-col items-center justify-center">
                {status === 'loading' && <Loader2 className="mx-auto h-24 w-24 text-muted-foreground animate-spin" />}
                {status === 'success' && <CheckCircle2 className="mx-auto h-24 w-24 text-green-500" />}
                {status === 'error' && <AlertCircle className="mx-auto h-24 w-24 text-destructive" />}
                
                <h1 className="mt-6 text-3xl font-extrabold text-primary mb-2">
                    {status === 'success' ? 'Obrigado pelo seu pedido!' : 'Status do Pagamento'}
                </h1>
                <p className="text-lg text-muted-foreground">{message || 'Verificando status do pagamento...'}</p>
                <Button asChild className="mt-8">
                    <Link to="/store">Continuar Comprando</Link>
                </Button>
            </main>
        </div>
    );
};

const OrderConfirmationPage = () => (
    <Elements stripe={stripePromise}>
        <OrderConfirmationContent />
    </Elements>
);


export default OrderConfirmationPage;
