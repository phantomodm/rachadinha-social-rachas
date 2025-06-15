
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllRachadinhas, getAppSettings, updateAppSetting, updateRachadinhaStatus } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useState, useEffect } from 'react';
import { Skeleton } from './ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const { data: rachadinhas, isLoading: isLoadingRachadinhas } = useQuery({
        queryKey: ['allRachadinhas'],
        queryFn: getAllRachadinhas,
    });

    const { data: appSettings, isLoading: isLoadingSettings } = useQuery({
        queryKey: ['appSettings'],
        queryFn: getAppSettings,
    });

    const [rachadinhaFee, setRachadinhaFee] = useState('');

    useEffect(() => {
        if (appSettings?.rachadinha_fee) {
            setRachadinhaFee(appSettings.rachadinha_fee);
        }
    }, [appSettings]);
    
    const updateSettingMutation = useMutation({
        mutationFn: ({ key, value }: { key: string, value: any }) => updateAppSetting(key, value),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['appSettings'] });
            toast({ title: 'Sucesso!', description: 'Configuração atualizada.' });
        },
        onError: (error: Error) => {
            toast({ title: 'Erro', description: `Não foi possível atualizar: ${error.message}`, variant: 'destructive' });
        }
    });
    
    const rachadinhaStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string, status: 'active' | 'archived' }) => updateRachadinhaStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['allRachadinhas'] });
            toast({ title: 'Sucesso!', description: 'Status da rachadinha atualizado.' });
        },
        onError: (error: Error) => {
            toast({ title: 'Erro', description: `Não foi possível atualizar status: ${error.message}`, variant: 'destructive' });
        }
    });

    const handleUpdateFee = () => {
        if (rachadinhaFee.trim() !== '' && !isNaN(Number(rachadinhaFee))) {
            updateSettingMutation.mutate({ key: 'rachadinha_fee', value: Number(rachadinhaFee) });
        }
    };
    
    const handleToggleArchive = (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'active' ? 'archived' : 'active';
        rachadinhaStatusMutation.mutate({ id, status: newStatus });
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold">Painel do Administrador</h1>
            
            <Card>
                <CardHeader>
                    <CardTitle>Configurações Globais</CardTitle>
                    <CardDescription>Altere as configurações aplicadas a todas as rachadinhas.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoadingSettings ? <Skeleton className="h-10 w-full" /> : (
                        <div className="flex items-center space-x-4">
                            <label htmlFor="rachadinhaFee" className="font-medium">Taxa do App (R$):</label>
                            <Input
                                id="rachadinhaFee"
                                type="number"
                                value={rachadinhaFee}
                                onChange={(e) => setRachadinhaFee(e.target.value)}
                                className="w-32"
                            />
                            <Button onClick={handleUpdateFee} disabled={updateSettingMutation.isPending}>
                                {updateSettingMutation.isPending ? 'Salvando...' : 'Salvar'}
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Todas as Rachadinhas</CardTitle>
                    <CardDescription>Gerencie todas as rachadinhas criadas no aplicativo.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoadingRachadinhas ? <Skeleton className="h-40 w-full" /> : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nome</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Criada em</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rachadinhas?.map(r => (
                                    <TableRow key={r.id}>
                                        <TableCell className="font-medium">{r.name}</TableCell>
                                        <TableCell>
                                            <Badge variant={r.status === 'active' ? 'default' : 'secondary'}>
                                                {r.status === 'active' ? 'Ativa' : 'Arquivada'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{new Date(r.created_at).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button variant="outline" size="sm" asChild>
                                                <Link to={`/rachadinha/${r.id}`}>Ver</Link>
                                            </Button>
                                            <Button 
                                                variant="ghost" 
                                                size="sm"
                                                onClick={() => handleToggleArchive(r.id, r.status)}
                                                disabled={rachadinhaStatusMutation.isPending}
                                            >
                                                {r.status === 'active' ? 'Arquivar' : 'Reativar'}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminDashboard;
