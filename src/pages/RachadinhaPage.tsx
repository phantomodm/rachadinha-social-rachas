
import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import RachadinhaCalculator from '@/components/RachadinhaCalculator';
import Header from '@/components/Header';
import { useQuery } from '@tanstack/react-query';
import { getRachadinhaData, Participant } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import TableNumberInput from '@/components/rachadinha/TableNumberInput';
import { useAuth } from '@/contexts/AuthContext';
import { useGuest } from '@/hooks/useGuest';
import JoinRachadinhaForm from '@/components/rachadinha/JoinRachadinhaForm';

const RachadinhaPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { session, loading: authLoading } = useAuth();
    const { isGuest, loginAsGuest } = useGuest(id);

    const { data: rachadinhaData, isLoading: isRachadinhaLoading } = useQuery({
        queryKey: ['rachadinha', id],
        queryFn: () => getRachadinhaData(id!),
        enabled: !!id,
    });
    
    const isLoading = authLoading || isRachadinhaLoading;

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

    const handleJoin = (participant: Participant) => {
        loginAsGuest(participant);
    };

    const shouldShowCalculator = session || isGuest;

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
                ) : !rachadinhaData ? (
                    <p>Rachadinha não encontrada.</p>
                ) : shouldShowCalculator ? (
                    <>
                        {rachadinhaData && !rachadinhaData.table_number && id && (
                            <TableNumberInput
                                rachadinhaId={id}
                                isPartner={!!rachadinhaData.vendor_id}
                                rachadinhaData={rachadinhaData}
                            />
                        )}
                        <RachadinhaCalculator rachadinhaId={id} onBack={handleBack} />
                    </>
                ) : (
                    <JoinRachadinhaForm
                        rachadinhaId={id}
                        rachadinhaName={rachadinhaData.name}
                        onJoin={handleJoin}
                    />
                )}
            </main>
        </div>
    );
};

export default RachadinhaPage;
