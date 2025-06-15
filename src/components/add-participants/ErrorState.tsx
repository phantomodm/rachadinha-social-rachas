
import React from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const ErrorState = () => {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Header />
            <main className="container mx-auto px-4 py-8 text-center">
                <p>Não foi possível carregar os dados da rachadinha.</p>
                <Button asChild variant="link" className="mt-4"><Link to="/">Voltar para o início</Link></Button>
            </main>
        </div>
    );
};

export default ErrorState;
