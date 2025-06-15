
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';

const MenuPage = () => {
    const { id } = useParams<{ id: string }>();

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Header />
            <main className="container mx-auto px-4 py-8 text-center">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">Cardápio do Restaurante</h1>
                <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">Este é o cardápio do estabelecimento parceiro. Em breve você poderá adicionar itens diretamente à sua rachadinha por aqui!</p>
                <div className="border rounded-lg p-12 text-center bg-card shadow-sm">
                    <p className="text-xl font-semibold text-primary">Em Breve</p>
                    <p className="text-muted-foreground mt-2">Funcionalidade de E-commerce em desenvolvimento.</p>
                </div>
                <Button asChild variant="outline" className="mt-8">
                    <Link to={`/rachadinha/${id}`}>
                        Voltar para a Rachadinha
                    </Link>
                </Button>
            </main>
        </div>
    );
};

export default MenuPage;
