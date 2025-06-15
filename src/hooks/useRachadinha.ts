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
  getAppSettings,
  bulkAddParticipants,
} from '@/lib/api';

const useRachadinha = (rachadinhaId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: fetchedRachadinhaData, isLoading: isLoadingRachadinha } = useQuery({
    queryKey: ['rachadinha', rachadinhaId],
    queryFn: () => getRachadinhaData(rachadinhaId),
    enabled: !!rachadinhaId,
  });

  const rachadinhaData = useMemo(() => {
    if (!fetchedRachadinhaData) return undefined;

    if (fetchedRachadinhaData.participants.length === 0 && fetchedRachadinhaData.items.length === 0) {
        const dummyParticipants = [
            { id: 'dummy-p1', name: 'João Silva', rachadinha_id: rachadinhaId },
            { id: 'dummy-p2', name: 'Maria Souza', rachadinha_id: rachadinhaId },
            { id: 'dummy-p3', name: 'Pedro Costa', rachadinha_id: rachadinhaId },
            { id: 'dummy-p4', name: 'Ana Pereira', rachadinha_id: rachadinhaId },
        ];
    
        const dummyItems = [
            { 
                id: 'dummy-i1', 
                name: 'Pizza de Calabresa', 
                price: 45.50, 
                rachadinha_id: rachadinhaId,
                item_participants: [
                    { participant_id: 'dummy-p1', item_id: 'dummy-i1' }, 
                    { participant_id: 'dummy-p2', item_id: 'dummy-i1' },
                ] 
            },
            { 
                id: 'dummy-i2', 
                name: 'Refrigerante 2L', 
                price: 12.00, 
                rachadinha_id: rachadinhaId,
                item_participants: [
                    { participant_id: 'dummy-p1', item_id: 'dummy-i2' }, 
                    { participant_id: 'dummy-p2', item_id: 'dummy-i2' },
                    { participant_id: 'dummy-p3', item_id: 'dummy-i2' },
                ] 
            },
            {
                id: 'dummy-i3',
                name: 'Porção de Fritas',
                price: 25.00,
                rachadinha_id: rachadinhaId,
                item_participants: [
                    { participant_id: 'dummy-p3', item_id: 'dummy-i3' },
                    { participant_id: 'dummy-p4', item_id: 'dummy-i3' },
                ]
            },
            {
                id: 'dummy-i4',
                name: 'Suco de Laranja',
                price: 8.00,
                rachadinha_id: rachadinhaId,
                item_participants: [
                    { participant_id: 'dummy-p4', item_id: 'dummy-i4' },
                ]
            }
        ];

        return {
            ...fetchedRachadinhaData,
            participants: dummyParticipants,
            items: dummyItems,
        };
    }
    return fetchedRachadinhaData;
  }, [fetchedRachadinhaData, rachadinhaId]);

  const { data: appSettings, isLoading: isLoadingAppSettings } = useQuery({
    queryKey: ['appSettings'],
    queryFn: getAppSettings,
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
  const bulkAddParticipantsMutation = createMutation((names: string[]) => bulkAddParticipants(rachadinhaId, names), 'adicionar participantes');
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
    if (!rachadinhaData || !appSettings) return { participantBreakdowns: {}, participantTotals: {}, totalBill: 0, totalServiceCharge: 0, totalWithoutService: 0, totalRachadinhaFee: 0 };
    
    const { participants, items, service_charge } = rachadinhaData;
    const rachadinha_fee = Number(appSettings?.rachadinha_fee || 1);

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
  }, [rachadinhaData, appSettings]);

  return {
    rachadinhaData,
    isLoadingRachadinha: isLoadingRachadinha || isLoadingAppSettings,
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
    bulkAddParticipantsMutation,
    removeParticipantMutation,
    addItemMutation,
    removeItemMutation,
    toggleItemParticipantMutation,
    handleAddParticipant,
    handleAddItem,
  };
};

export default useRachadinha;
