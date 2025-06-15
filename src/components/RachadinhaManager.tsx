
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRachadinhas, updateRachadinhaStatus } from '@/lib/api';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Skeleton } from './ui/skeleton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Zap, Archive, CheckCircle } from 'lucide-react';
import { useToast } from './ui/use-toast';

const RachadinhaManager = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const { data: rachadinhas, isLoading } = useQuery({
        queryKey: ['rachadinhas', user?.id],
        queryFn: () => getRachadinhas(user!.id),
        enabled: !!user,
    });

    const archiveMutation = useMutation({
        mutationFn: (rachadinhaId: string) => updateRachadinhaStatus(rachadinhaId, 'archived'),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rachadinhas', user?.id] });
            toast({ title: "Sucesso", description: "Rachadinha arquivada." });
        },
        onError: (error: Error) => {
            toast({ title: 'Erro ao arquivar', description: error.message, variant: 'destructive' });
        }
    });

    const handleArchive = (e: React.MouseEvent, rachadinhaId: string) => {
        e.stopPropagation();
        archiveMutation.mutate(rachadinhaId);
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        );
    }
    
    const activeRachadinhas = rachadinhas?.filter(r => r.status === 'active') || [];
    const archivedRachadinhas = rachadinhas?.filter(r => r.status === 'archived') || [];

    return (
        <div className="animate-fade-in space-y-8">
            <div>
                <Button size="lg" className="w-full" onClick={() => navigate('/create-rachadinha')}>
                    <PlusCircle className="mr-2" />
                    Começar uma Rachadinha!
                </Button>
            </div>

            {(!rachadinhas || rachadinhas.length === 0) && (
                <Card className="text-center p-8">
                    <CardHeader>
                        <Zap className="mx-auto h-12 w-12 text-primary" />
                        <CardTitle className="mt-4 text-2xl">Nenhuma rachadinha por aqui</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Que tal começar uma agora?</p>
                    </CardContent>
                </Card>
            )}

            {activeRachadinhas.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Minhas Rachadinhas Ativas</CardTitle>
                        <CardDescription>Continue de onde parou.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {activeRachadinhas.map(r => (
                            <div key={r.id} className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    className="w-full justify-between h-16 text-left flex-grow"
                                    onClick={() => navigate(`/rachadinha/${r.id}`)}
                                >
                                    <div className="flex flex-col">
                                        <span className="font-semibold">{r.name}</span>
                                        <span className="text-sm text-muted-foreground">
                                            Criada em {format(new Date(r.created_at), "dd/MM/yyyy", { locale: ptBR })}
                                        </span>
                                    </div>
                                    <span className="text-sm text-muted-foreground">{format(new Date(r.created_at), "HH:mm", { locale: ptBR })}</span>
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => handleArchive(e, r.id)}
                                    disabled={archiveMutation.isPending && archiveMutation.variables === r.id}
                                    aria-label="Arquivar rachadinha"
                                >
                                    <CheckCircle className="h-5 w-5 text-green-500 hover:text-green-600" />
                                </Button>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {rachadinhas && rachadinhas.length > 0 && activeRachadinhas.length === 0 && (
                 <Card className="text-center p-8">
                    <CardHeader>
                        <Zap className="mx-auto h-12 w-12 text-primary" />
                        <CardTitle className="mt-4 text-2xl">Nenhuma rachadinha ativa</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Você não tem rachadinhas em andamento.</p>
                    </CardContent>
                </Card>
            )}


            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Archive className="mr-2 h-5 w-5 text-muted-foreground" />
                        Rachadinhas Anteriores
                    </CardTitle>
                    <CardDescription>Suas contas já finalizadas.</CardDescription>
                </CardHeader>
                <CardContent>
                    {archivedRachadinhas.length > 0 ? (
                        <div className="space-y-2">
                            {archivedRachadinhas.map(r => (
                                <Button
                                    key={r.id}
                                    variant="outline"
                                    className="w-full justify-between h-16 text-left"
                                    onClick={() => navigate(`/rachadinha/${r.id}`)}
                                >
                                    <div className="flex flex-col">
                                        <span className="font-semibold">{r.name}</span>
                                        <span className="text-sm text-muted-foreground">
                                            Finalizada em {format(new Date(r.created_at), "dd/MM/yyyy", { locale: ptBR })}
                                        </span>
                                    </div>
                                     <span className="text-sm text-muted-foreground">{format(new Date(r.created_at), "HH:mm", { locale: ptBR })}</span>
                                </Button>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-sm">Nenhuma rachadinha anterior encontrada.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default RachadinhaManager;
