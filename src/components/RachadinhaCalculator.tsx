
import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { UserPlus, Trash2, PlusCircle, FileText, Users, DollarSign, CheckCircle, ArrowLeft } from 'lucide-react';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRachadinhaData, updateServiceCharge, addParticipant, removeParticipant, addItem, removeItem, toggleItemParticipant } from '@/lib/api';
import { Skeleton } from './ui/skeleton';
import { useToast } from './ui/use-toast';
import { useDebounce } from 'use-debounce';

interface RachadinhaCalculatorProps {
  rachadinhaId: string;
  onBack: () => void;
}

const RachadinhaCalculator = ({ rachadinhaId, onBack }: RachadinhaCalculatorProps) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: rachadinhaData, isLoading: isLoadingRachadinha } = useQuery({
    queryKey: ['rachadinha', rachadinhaId],
    queryFn: () => getRachadinhaData(rachadinhaId),
    enabled: !!rachadinhaId,
  });

  const [newParticipantName, setNewParticipantName] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [localServiceCharge, setLocalServiceCharge] = useState(rachadinhaData?.service_charge ?? 10);
  const [paidStatus, setPaidStatus] = useState<Record<string, boolean>>({});

  const [debouncedServiceCharge] = useDebounce(localServiceCharge, 500);

  useEffect(() => {
    if (rachadinhaData) {
      setLocalServiceCharge(rachadinhaData.service_charge);
    }
  }, [rachadinhaData]);

  const serviceChargeMutation = useMutation({
    mutationFn: (newVal: number) => updateServiceCharge(rachadinhaId, newVal),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['rachadinha', rachadinhaId] });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro', description: `Não foi possível atualizar a taxa de serviço: ${error.message}`, variant: 'destructive' });
    }
  });

  useEffect(() => {
      if (rachadinhaData && debouncedServiceCharge !== rachadinhaData.service_charge) {
          serviceChargeMutation.mutate(debouncedServiceCharge);
      }
  }, [debouncedServiceCharge, rachadinhaData, serviceChargeMutation]);

  const createMutation = <TVariables,>(fn: (variables: TVariables) => Promise<unknown>, entity: string) => useMutation({
    mutationFn: fn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rachadinha', rachadinhaId] });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro', description: `Não foi possível ${entity}: ${error.message}`, variant: 'destructive' });
    }
  });

  const addParticipantMutation = createMutation((name: string) => addParticipant(rachadinhaId, name), 'adicionar participante');
  const removeParticipantMutation = createMutation(removeParticipant, 'remover participante');
  const addItemMutation = createMutation((vars: { name: string, price: number, participantIds: string[] }) => addItem(rachadinhaId, vars.name, vars.price, vars.participantIds), 'adicionar item');
  const removeItemMutation = createMutation(removeItem, 'remover item');
  const toggleItemParticipantMutation = createMutation((vars: { itemId: string, participantId: string, isMember: boolean }) => toggleItemParticipant(vars.itemId, vars.participantId, vars.isMember), 'atualizar item');

  const handleAddParticipant = () => {
    if (newParticipantName.trim()) {
      addParticipantMutation.mutate(newParticipantName.trim());
      setNewParticipantName('');
    }
  };

  const handleAddItem = () => {
    if (newItemName.trim() && parseFloat(newItemPrice) > 0 && rachadinhaData?.participants.length) {
      const allParticipantIds = rachadinhaData.participants.map(p => p.id);
      addItemMutation.mutate({ name: newItemName.trim(), price: parseFloat(newItemPrice), participantIds: allParticipantIds });
      setNewItemName('');
      setNewItemPrice('');
    }
  };
  
  const togglePaidStatus = (participantId: string) => {
    setPaidStatus(prev => ({ ...prev, [participantId]: !prev[participantId] }));
  };

  const calculation = useMemo(() => {
    if (!rachadinhaData) return { participantTotals: {}, totalBill: 0, totalServiceCharge: 0, totalWithoutService: 0 };
    
    const { participants, items, service_charge } = rachadinhaData;
    const participantTotals: Record<string, number> = {};
    participants.forEach(p => participantTotals[p.id] = 0);

    items.forEach(item => {
      const participantIds = item.item_participants.map(ip => ip.participant_id);
      if (participantIds.length > 0) {
        const share = Number(item.price) / participantIds.length;
        participantIds.forEach(pId => {
          if (participantTotals[pId] !== undefined) {
            participantTotals[pId] += share;
          }
        });
      }
    });
    
    const totalWithoutService = Object.values(participantTotals).reduce((sum, total) => sum + total, 0);
    const totalServiceCharge = totalWithoutService * (Number(service_charge) / 100);

    const finalTotals: Record<string, number> = {};
    participants.forEach(p => {
        const individualTotal = participantTotals[p.id] || 0;
        if (totalWithoutService > 0) {
            const proportionalServiceCharge = (individualTotal / totalWithoutService) * totalServiceCharge;
            finalTotals[p.id] = individualTotal + proportionalServiceCharge;
        } else {
            finalTotals[p.id] = 0;
        }
    });

    const totalBill = totalWithoutService + totalServiceCharge;
    return { participantTotals: finalTotals, totalBill, totalServiceCharge, totalWithoutService };
  }, [rachadinhaData]);

  if (isLoadingRachadinha) {
    return (
        <div className="space-y-4">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
        </div>
    );
  }

  if (!rachadinhaData) {
      return <p>Não foi possível carregar os dados da rachadinha.</p>
  }

  const { participants, items } = rachadinhaData;

  return (
    <div className="space-y-8 animate-fade-in">
        <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="mr-2 h-4 w-4" />Voltar para minhas rachadinhas</Button>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Users className="text-primary"/>Adicionar Galera</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input type="text" value={newParticipantName} onChange={(e) => setNewParticipantName(e.target.value)} placeholder="Nome do participante" onKeyPress={(e) => e.key === 'Enter' && handleAddParticipant()} disabled={addParticipantMutation.isPending}/>
            <Button onClick={handleAddParticipant} disabled={addParticipantMutation.isPending}><UserPlus className="mr-2 h-4 w-4"/>{addParticipantMutation.isPending ? 'Adicionando...' : 'Adicionar'}</Button>
          </div>
          <div className="space-y-2">
            {participants.map(p => (
              <div key={p.id} className="flex items-center justify-between bg-muted/50 p-2 rounded-md">
                <span>{p.name}</span>
                <Button variant="ghost" size="icon" onClick={() => removeParticipantMutation.mutate(p.id)} disabled={removeParticipantMutation.isPending && removeParticipantMutation.variables === p.id}><Trash2 className="h-4 w-4 text-destructive"/></Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {participants.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><DollarSign className="text-primary"/>Lançar Itens</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-2 mb-4">
              <Input type="text" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} placeholder="Nome do item" disabled={addItemMutation.isPending} />
              <Input type="number" value={newItemPrice} onChange={(e) => setNewItemPrice(e.target.value)} placeholder="Preço (R$)" disabled={addItemMutation.isPending}/>
              <Button onClick={handleAddItem} className="w-full md:w-auto" disabled={addItemMutation.isPending}><PlusCircle className="mr-2 h-4 w-4"/>{addItemMutation.isPending ? 'Lançando...' : 'Lançar'}</Button>
            </div>
            <div className="space-y-4">
              {items.map(item => (
                <div key={item.id} className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-muted-foreground">R$ {Number(item.price).toFixed(2)}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeItemMutation.mutate(item.id)} disabled={removeItemMutation.isPending && removeItemMutation.variables === item.id}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {participants.map(p => {
                      const isMember = item.item_participants.some(ip => ip.participant_id === p.id);
                      return (
                      <div key={p.id} className="flex items-center space-x-2">
                        <Checkbox id={`item-${item.id}-participant-${p.id}`} checked={isMember} onCheckedChange={() => toggleItemParticipantMutation.mutate({ itemId: item.id, participantId: p.id, isMember })} />
                        <Label htmlFor={`item-${item.id}-participant-${p.id}`}>{p.name}</Label>
                      </div>
                    )})}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {items.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="text-primary"/>A Conta Final</CardTitle></CardHeader>
          <CardContent>
            <div className="mb-4">
              <Label htmlFor="service-charge">Taxa de Serviço (%)</Label>
              <Input id="service-charge" type="number" value={localServiceCharge} onChange={(e) => setLocalServiceCharge(Number(e.target.value))} className="w-24 mt-1" />
            </div>
            <div className="space-y-2">
              {participants.map(p => (
                <div key={p.id} className={`flex items-center justify-between p-3 rounded-lg transition-all ${paidStatus[p.id] ? 'bg-green-100 dark:bg-green-900/50' : 'bg-muted/50'}`}>
                  <div>
                    <p className={`font-semibold ${paidStatus[p.id] ? 'line-through' : ''}`}>{p.name}</p>
                    <p className={`text-xl font-bold text-primary ${paidStatus[p.id] ? 'line-through' : ''}`}>R$ {(calculation.participantTotals[p.id] || 0).toFixed(2)}</p>
                  </div>
                  <Button variant={paidStatus[p.id] ? "secondary" : "default"} size="sm" onClick={() => togglePaidStatus(p.id)}><CheckCircle className="mr-2 h-4 w-4"/>{paidStatus[p.id] ? 'Pago' : 'Marcar como pago'}</Button>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-start bg-muted/20 p-4 rounded-b-lg">
             <p className="text-sm">Subtotal: R$ {calculation.totalWithoutService.toFixed(2)}</p>
             <p className="text-sm">Serviço ({rachadinhaData.service_charge}%): R$ {calculation.totalServiceCharge.toFixed(2)}</p>
             <p className="text-2xl font-bold mt-2">Total da Conta: R$ {calculation.totalBill.toFixed(2)}</p>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default RachadinhaCalculator;
