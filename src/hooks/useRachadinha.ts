
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
    if (!rachadinhaData) return { participantBreakdowns: {}, participantTotals: {}, totalBill: 0, totalServiceCharge: 0, totalWithoutService: 0, totalRachadinhaFee: 0 };
    
    const { participants, items, service_charge } = rachadinhaData;
    const rachadinha_fee = 1; // Using a default fee of 1. We can make this dynamic later.

    const participantBreakdowns: Record<string, {
        individualItemsTotal: number;
        sharedItemsShare: number;
        subtotal: number;
        serviceChargePortion: number;
        rachadinhaFee: number;
        total: number;
    }> = {};

    let totalConsumed = 0;

    participants.forEach(p => {
        participantBreakdowns[p.id] = {
            individualItemsTotal: 0,
            sharedItemsShare: 0,
            subtotal: 0,
            serviceChargePortion: 0,
            rachadinhaFee: Number(rachadinha_fee || 0),
            total: 0
        };
    });

    items.forEach(item => {
        const participantIds = item.item_participants.map(ip => ip.participant_id);
        const price = Number(item.price);
        
        if (participantIds.length > 0) {
            if (participantIds.length === 1) { // Individual item
                const pId = participantIds[0];
                if (participantBreakdowns[pId]) {
                    participantBreakdowns[pId].individualItemsTotal += price;
                }
            } else { // Shared item
                const share = price / participantIds.length;
                participantIds.forEach(pId => {
                    if (participantBreakdowns[pId]) {
                        participantBreakdowns[pId].sharedItemsShare += share;
                    }
                });
            }
        }
    });

    participants.forEach(p => {
        const breakdown = participantBreakdowns[p.id];
        breakdown.subtotal = breakdown.individualItemsTotal + breakdown.sharedItemsShare;
        totalConsumed += breakdown.subtotal;
    });
    
    const totalServiceCharge = totalConsumed * (Number(service_charge) / 100);
    const totalRachadinhaFee = participants.length * Number(rachadinha_fee || 0);

    participants.forEach(p => {
        const breakdown = participantBreakdowns[p.id];
        if (totalConsumed > 0) {
            breakdown.serviceChargePortion = (breakdown.subtotal / totalConsumed) * totalServiceCharge;
        }
        breakdown.total = breakdown.subtotal + breakdown.serviceChargePortion + breakdown.rachadinhaFee;
    });

    const totalBill = totalConsumed + totalServiceCharge + totalRachadinhaFee;

    const participantTotals: Record<string, number> = {};
    participants.forEach(p => {
        participantTotals[p.id] = participantBreakdowns[p.id]?.total || 0;
    });

    return { participantTotals, participantBreakdowns, totalBill, totalServiceCharge, totalWithoutService: totalConsumed, totalRachadinhaFee };
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
