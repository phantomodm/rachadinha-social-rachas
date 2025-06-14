
import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';
import { useToast } from '@/components/ui/use-toast';
import {
  getRachadinhaData,
  updateServiceCharge,
  addParticipant,
  removeParticipant,
  addItem,
  removeItem,
  toggleItemParticipant,
} from '@/lib/api';

const useRachadinha = (rachadinhaId: string) => {
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

  return {
    rachadinhaData,
    isLoadingRachadinha,
    newParticipantName,
    setNewParticipantName,
    newItemName,
    setNewItemName,
    newItemPrice,
    setNewItemPrice,
    localServiceCharge,
    setLocalServiceCharge,
    paidStatus,
    togglePaidStatus,
    calculation,
    addParticipantMutation,
    removeParticipantMutation,
    addItemMutation,
    removeItemMutation,
    toggleItemParticipantMutation,
    handleAddParticipant,
    handleAddItem,
  };
};

export default useRachadinha;

