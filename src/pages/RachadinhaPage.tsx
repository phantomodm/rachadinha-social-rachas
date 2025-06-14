
import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import RachadinhaCalculator from '@/components/RachadinhaCalculator';
import Header from '@/components/Header';

const RachadinhaPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    if (!id) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <p className="mb-4">Rachadinha não encontrada.</p>
                <Link to="/" className="text-primary hover:underline">Voltar para o Dashboard</Link>
            </div>
        );
    }

    const handleBack = () => {
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Header />
            <main className="container mx-auto px-4 py-8">
                <RachadinhaCalculator rachadinhaId={id} onBack={handleBack} />
            </main>
        </div>
    );
};

export default RachadinhaPage;
