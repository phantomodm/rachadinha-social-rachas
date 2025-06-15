import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ClipboardCheck } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { RachadinhaData } from '@/lib/api';

interface TableNumberInputProps {
    rachadinhaId: string;
    isPartner: boolean;
    rachadinhaData: RachadinhaData;
}

const updateTableNumber = async ({ rachadinhaId, tableNumber }: { rachadinhaId: string, tableNumber: string }) => {
    const { data, error } = await supabase
        .from('rachadinhas')
        .update({ table_number: tableNumber })
        .eq('id', rachadinhaId)
        .select()
        .single();
        
    if (error) throw error;
    return data;
};


const TableNumberInput = ({ rachadinhaId, isPartner, rachadinhaData }: TableNumberInputProps) => {
    const [tableNumber, setTableNumber] = useState('');
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const navigate = useNavigate();

    const mutation = useMutation({
        mutationFn: updateTableNumber,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rachadinha', rachadinhaId] });
            toast({ title: 'Sucesso!', description: 'Número da mesa salvo.' });

            if (rachadinhaData.vendors?.has_menu) {
                navigate(`/rachadinha/${rachadinhaId}/menu`);
            }
        },
        onError: (error: Error) => {
            toast({ title: 'Erro', description: `Não foi possível salvar o número da mesa: ${error.message}`, variant: 'destructive' });
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (tableNumber.trim()) {
            mutation.mutate({ rachadinhaId, tableNumber: tableNumber.trim() });
        }
    };

    return (
        <Card className="my-6 animate-fade-in">
            <CardHeader>
                {isPartner ? (
                    <>
                        <CardTitle>Restaurante Parceiro Detectado!</CardTitle>
                        <CardDescription>
                            Este estabelecimento usa o Rachadinha para fechar a conta. Informe o número da sua mesa para agilizar o processo.
                        </CardDescription>
                    </>
                ) : (
                    <>
                        <CardTitle>Adicionar número da mesa</CardTitle>
                        <CardDescription>
                            Informe o número da sua mesa para referência.
                        </CardDescription>
                    </>
                )}
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <Input 
                        placeholder="Número da mesa" 
                        value={tableNumber}
                        onChange={e => setTableNumber(e.target.value)}
                        disabled={mutation.isPending}
                        autoFocus
                    />
                    <Button type="submit" disabled={!tableNumber.trim() || mutation.isPending}>
                        {mutation.isPending ? 'Salvando...' : <><ClipboardCheck className="mr-2 h-4 w-4" /> Salvar</>}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};

export default TableNumberInput;
