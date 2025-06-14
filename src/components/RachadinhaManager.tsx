
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRachadinhas, createRachadinha } from '@/lib/api';
import RachadinhaCalculator from './RachadinhaCalculator';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { PlusCircle, MapPin } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from "@/components/ui/use-toast";

const RachadinhaManager = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [selectedRachadinhaId, setSelectedRachadinhaId] = useState<string | null>(null);
    const [newRachadinhaName, setNewRachadinhaName] = useState('');
    const [isLocating, setIsLocating] = useState(false);

    const { data: rachadinhas, isLoading } = useQuery({
        queryKey: ['rachadinhas', user?.id],
        queryFn: () => getRachadinhas(user!.id),
        enabled: !!user,
    });

    const createMutation = useMutation({
        mutationFn: (variables: { name: string; latitude?: number; longitude?: number }) => 
            createRachadinha({ userId: user!.id, ...variables }),
        onSuccess: (newRachadinha) => {
            queryClient.invalidateQueries({ queryKey: ['rachadinhas', user?.id] });
            setSelectedRachadinhaId(newRachadinha.id);
            setNewRachadinhaName('');
        }
    });
    
    const handleCreate = () => {
        if(newRachadinhaName.trim()){
            createMutation.mutate({ name: newRachadinhaName.trim() });
        }
    };
    
    const handleCreateWithLocation = () => {
        if (!navigator.geolocation) {
            toast({
                title: "Erro de Localização",
                description: "Geolocalização não é suportada neste navegador.",
                variant: "destructive",
            });
            return;
        }

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const rachadinhaName = `Rachadinha nas Proximidades`;
                createMutation.mutate(
                    { name: rachadinhaName, latitude, longitude },
                    {
                        onSettled: () => setIsLocating(false)
                    }
                );
            },
            (error) => {
                toast({
                    title: "Erro de Localização",
                    description: `Não foi possível obter sua localização: ${error.message}`,
                    variant: "destructive",
                });
                setIsLocating(false);
            }
        );
    };

    if (selectedRachadinhaId) {
        return <RachadinhaCalculator rachadinhaId={selectedRachadinhaId} onBack={() => setSelectedRachadinhaId(null)} />;
    }

    if (isLoading) return (
        <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
        </div>
    );

    if (!rachadinhas || rachadinhas.length === 0) {
        return (
            <Card className="text-center p-8 animate-fade-in">
                <CardHeader>
                    <CardTitle className="text-2xl">Crie sua primeira rachadinha!</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground mb-6">Dê um nome para sua rachadinha para começar, ou use sua localização.</p>
                    <div className="flex flex-col gap-4 max-w-sm mx-auto">
                        <div className="flex gap-2">
                            <Input 
                                value={newRachadinhaName}
                                onChange={(e) => setNewRachadinhaName(e.target.value)}
                                placeholder="Ex: Almoço da firma"
                                onKeyPress={(e) => e.key === 'Enter' && handleCreate()}
                                disabled={createMutation.isPending || isLocating}
                            />
                            <Button onClick={handleCreate} disabled={createMutation.isPending || isLocating}>
                                <PlusCircle className="mr-2 h-4 w-4"/>
                                {createMutation.isPending && !isLocating ? "Criando..." : "Criar"}
                            </Button>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                <div className="w-full border-t border-border" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card px-2 text-muted-foreground">
                                Ou
                                </span>
                            </div>
                        </div>
                        <Button onClick={handleCreateWithLocation} variant="outline" disabled={createMutation.isPending || isLocating}>
                            <MapPin className="mr-2 h-4 w-4" />
                            {isLocating ? "Localizando..." : "Criar com minha localização"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }
    
    return (
        <div className="animate-fade-in space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Suas Rachadinhas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {rachadinhas.map(r => (
                        <Button key={r.id} variant="outline" className="w-full justify-between h-14 text-left" onClick={() => setSelectedRachadinhaId(r.id)}>
                            <span className="font-semibold">{r.name}</span>
                            <span className="text-sm text-muted-foreground">{format(new Date(r.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
                        </Button>
                    ))}
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Criar Nova Rachadinha</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-4 max-w-md">
                        <div className="flex gap-2">
                            <Input 
                                value={newRachadinhaName}
                                onChange={(e) => setNewRachadinhaName(e.target.value)}
                                placeholder="Ex: Jantar de sexta"
                                onKeyPress={(e) => e.key === 'Enter' && handleCreate()}
                                disabled={createMutation.isPending || isLocating}
                            />
                            <Button onClick={handleCreate} disabled={createMutation.isPending || isLocating}>
                                <PlusCircle className="mr-2 h-4 w-4"/>
                                {createMutation.isPending && !isLocating ? "Criando..." : "Criar"}
                            </Button>
                        </div>
                         <div className="relative">
                            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                <div className="w-full border-t border-border" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card px-2 text-muted-foreground">
                                Ou
                                </span>
                            </div>
                        </div>
                        <Button onClick={handleCreateWithLocation} variant="outline" disabled={createMutation.isPending || isLocating}>
                            <MapPin className="mr-2 h-4 w-4" />
                            {isLocating ? "Localizando..." : "Criar com minha localização"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default RachadinhaManager;
