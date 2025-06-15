
import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import RachadinhaCalculator from '@/components/RachadinhaCalculator';
import Header from '@/components/Header';
import { useQuery } from '@tanstack/react-query';
import { getRachadinhaData } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import TableNumberInput from '@/components/rachadinha/TableNumberInput';

const RachadinhaPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { data: rachadinhaData, isLoading } = useQuery({
        queryKey: ['rachadinha', id],
        queryFn: () => getRachadinhaData(id!),
        enabled: !!id,
    });

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
                {isLoading ? (
                     <div className="space-y-6">
                        <Skeleton className="h-32 w-full rounded-lg" />
                        <Skeleton className="h-16 w-full rounded-lg" />
                        <Skeleton className="h-64 w-full rounded-lg" />
                    </div>
                ) : (
                    <>
                        {rachadinhaData && !rachadinhaData.table_number && id && (
                            <TableNumberInput
                                rachadinhaId={id}
                                isPartner={!!rachadinhaData.vendor_id}
                            />
                        )}
                        <RachadinhaCalculator rachadinhaId={id} onBack={handleBack} />
                    </>
                )}
            </main>
        </div>
    );
};

export default RachadinhaPage;
