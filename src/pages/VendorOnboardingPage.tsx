
import { useState } from 'react';
import Header from '@/components/Header';
import { Link, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getVendorByUserId } from '@/lib/api';
import { Loader2, CheckCircle } from 'lucide-react';
import VendorDetailsForm from '@/components/VendorDetailsForm';

const VendorOnboardingPage = () => {
    const { user, loading: authLoading } = useAuth();
    const [onboardingComplete, setOnboardingComplete] = useState(false);
    
    const { data: vendor, isLoading: vendorLoading } = useQuery({
      queryKey: ['vendor', user?.id],
      queryFn: () => getVendorByUserId(user!.id),
      enabled: !!user,
      onSuccess: (data) => {
        if (data?.name) {
          setOnboardingComplete(true);
        }
      }
    });

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
    
    if (!vendor || vendor.subscription_status !== 'active') {
        return (
            <div className="flex flex-col min-h-screen bg-background text-foreground">
                <Header />
                <main className="flex-grow container mx-auto px-4 py-8 text-center flex flex-col items-center justify-center">
                    <h1 className="mt-6 text-3xl font-extrabold text-destructive mb-2">
                        Assinatura não encontrada
                    </h1>
                    <p className="text-lg text-muted-foreground">Não encontramos uma assinatura ativa para sua conta. Se você acabou de assinar, aguarde alguns instantes.</p>
                    <Button asChild className="mt-8">
                        <Link to="/become-vendor">Ver Planos</Link>
                    </Button>
                </main>
            </div>
        )
    }

    if (onboardingComplete) {
        return (
            <div className="flex flex-col min-h-screen bg-background text-foreground">
                <Header />
                <main className="flex-grow container mx-auto px-4 py-8 text-center flex flex-col items-center justify-center">
                    <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                    <h1 className="mt-6 text-3xl font-extrabold text-primary mb-2">
                        Cadastro Completo!
                    </h1>
                    <p className="text-lg text-muted-foreground">Seus dados de vendedor foram salvos com sucesso.</p>
                    <p className="text-muted-foreground mt-4">(Em breve: Painel do vendedor para gerenciar cardápio e pedidos)</p>
                    <Button asChild className="mt-8">
                        <Link to="/">Voltar para o Início</Link>
                    </Button>
                </main>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8">
                <div className="text-center">
                    <h1 className="mt-6 text-3xl font-extrabold text-primary mb-2">
                        Parabéns! Sua assinatura está ativa.
                    </h1>
                    <p className="text-lg text-muted-foreground mb-8">Agora vamos completar seu cadastro de vendedor.</p>
                </div>
                {vendor && <VendorDetailsForm vendor={vendor} onSuccess={() => setOnboardingComplete(true)} />}
            </main>
        </div>
    );
};

export default VendorOnboardingPage;
