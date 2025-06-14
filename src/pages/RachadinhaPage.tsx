
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import RachadinhaCalculator from '@/components/RachadinhaCalculator';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

const RachadinhaPage = () => {
    const { id } = useParams<{ id: string }>();

    if (!id) {
        return (
            <div>
                <p>Rachadinha não encontrada.</p>
                <Link to="/">Voltar para o Dashboard</Link>
            </div>
        );
    }

    // RachadinhaCalculator has an optional `onBack` prop we are not using here,
    // as this page component provides its own back navigation.
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Header />
            <main className="container mx-auto px-4 py-8">
                <Button asChild variant="outline" className="mb-4">
                    <Link to="/">
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Voltar para o Dashboard
                    </Link>
                </Button>
                <RachadinhaCalculator rachadinhaId={id} />
            </main>
        </div>
    );
};

export default RachadinhaPage;
