import React from 'react';
import Header from '@/components/Header';
import CreateRachadinhaForm from '@/components/CreateRachadinhaForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CreateRachadinhaPage = () => {
    const navigate = useNavigate();

    const handleRachadinhaCreated = (rachadinhaId: string) => {
        navigate(`/rachadinha/${rachadinhaId}`);
    };

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
                <div className="max-w-md mx-auto">
                    <Card>
                        <CardHeader>
                            <CardTitle>Onde é a Rachadinha?</CardTitle>
                            <CardDescription>
                                Pesquise por um local, digite um nome, ou use sua localização para começar.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <CreateRachadinhaForm onRachadinhaCreated={handleRachadinhaCreated} />
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
};

export default CreateRachadinhaPage;
