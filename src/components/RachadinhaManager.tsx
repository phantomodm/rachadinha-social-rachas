
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRachadinhas, createRachadinha } from '@/lib/api';
import RachadinhaCalculator from './RachadinhaCalculator';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { PlusCircle } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const RachadinhaManager = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [selectedRachadinhaId, setSelectedRachadinhaId] = useState<string | null>(null);
    const [newRachadinhaName, setNewRachadinhaName] = useState('');

    const { data: rachadinhas, isLoading } = useQuery({
        queryKey: ['rachadinhas', user?.id],
        queryFn: () => getRachadinhas(user!.id),
        enabled: !!user,
    });

    const createMutation = useMutation({
        mutationFn: (name: string) => createRachadinha(user!.id, name),
        onSuccess: (newRachadinha) => {
            queryClient.invalidateQueries({ queryKey: ['rachadinhas', user?.id] });
            setSelectedRachadinhaId(newRachadinha.id);
            setNewRachadinhaName('');
        }
    });
    
    const handleCreate = () => {
        if(newRachadinhaName.trim()){
            createMutation.mutate(newRachadinhaName.trim());
        }
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
                    <p className="text-muted-foreground mb-6">Dê um nome para sua rachadinha para começar.</p>
                    <div className="flex gap-2 max-w-sm mx-auto">
                        <Input 
                            value={newRachadinhaName}
                            onChange={(e) => setNewRachadinhaName(e.target.value)}
                            placeholder="Ex: Almoço da firma"
                            onKeyPress={(e) => e.key === 'Enter' && handleCreate()}
                        />
                        <Button onClick={handleCreate} disabled={createMutation.isPending}>
                            <PlusCircle className="mr-2 h-4 w-4"/>
                            {createMutation.isPending ? "Criando..." : "Criar"}
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
                    <div className="flex gap-2 max-w-md">
                        <Input 
                            value={newRachadinhaName}
                            onChange={(e) => setNewRachadinhaName(e.target.value)}
                            placeholder="Ex: Jantar de sexta"
                            onKeyPress={(e) => e.key === 'Enter' && handleCreate()}
                        />
                        <Button onClick={handleCreate} disabled={createMutation.isPending}>
                            <PlusCircle className="mr-2 h-4 w-4"/>
                            {createMutation.isPending ? "Criando..." : "Criar"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default RachadinhaManager;
