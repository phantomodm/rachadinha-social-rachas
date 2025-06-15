import { useEffect } from 'react';
import { useDebounce } from 'use-debounce';
import { useRachadinhaData } from './useRachadinhaData';
import { useRachadinhaMutations } from './useRachadinhaMutations';
import { useRachadinhaCalculation } from './useRachadinhaCalculation';
import { useRachadinhaState } from './useRachadinhaState';
import { useGuest } from './useGuest';
import { useToast } from '@/components/ui/use-toast';

const useRachadinha = (rachadinhaId: string) => {
  const { toast } = useToast();
  // 1. Data fetching & Guest Session
  const { rachadinhaData, appSettings, isLoading } = useRachadinhaData(rachadinhaId);
  const { guestSession, isGuest } = useGuest(rachadinhaId);

  // 2. Local State Management
  const {
    newParticipantName, setNewParticipantName,
    newItemName, setNewItemName,
    newItemPrice, setNewItemPrice,
    localServiceCharge, setLocalServiceCharge,
    paidStatus,
    togglePaidStatus,
  } = useRachadinhaState(rachadinhaData);

  // 3. Mutations
  const mutations = useRachadinhaMutations(rachadinhaId);

  // 4. Calculations
  const calculation = useRachadinhaCalculation(rachadinhaData, appSettings);
  
  // 5. Side Effects (Debounced Service Charge)
  const [debouncedServiceCharge] = useDebounce(localServiceCharge, 500);

  useEffect(() => {
    if (rachadinhaData && debouncedServiceCharge !== rachadinhaData.service_charge) {
        mutations.serviceChargeMutation.mutate(debouncedServiceCharge);
    }
  }, [debouncedServiceCharge, rachadinhaData, mutations.serviceChargeMutation]);

  // 6. Event Handlers
  const handleAddParticipant = () => {
    if (isGuest) return;
    if (newParticipantName.trim()) {
      mutations.addParticipantMutation.mutate(newParticipantName.trim());
      setNewParticipantName('');
    }
  };

  const handleAddItem = () => {
    if (newItemName.trim() && parseFloat(newItemPrice) > 0 && rachadinhaData?.participants.length) {
      const participantIds = isGuest
        ? [guestSession!.participantId]
        : rachadinhaData.participants.map(p => p.id);
      
      mutations.addItemMutation.mutate({ name: newItemName.trim(), price: parseFloat(newItemPrice), participantIds });
      setNewItemName('');
      setNewItemPrice('');
    }
  };
  
  // Wrap mutations to add guest restrictions
  const wrapMutation = (mutation: any, allowed: boolean, message: string) => ({
    ...mutation,
    mutate: (...args: any) => {
      if (!allowed) {
        toast({ title: "Ação não permitida", description: message, variant: "destructive" });
        return;
      }
      return mutation.mutate(...args);
    },
    mutateAsync: async (...args: any) => {
      if (!allowed) {
        toast({ title: "Ação não permitida", description: message, variant: "destructive" });
        return;
      }
      return mutation.mutateAsync(...args);
    }
  });

  const removeParticipantMutation = wrapMutation(mutations.removeParticipantMutation, !isGuest, 'Convidados não podem remover participantes.');
  const removeItemMutation = wrapMutation(mutations.removeItemMutation, !isGuest, 'Convidados não podem remover itens.');

  const toggleItemParticipantMutation = {
    ...mutations.toggleItemParticipantMutation,
    mutate: (variables: { itemId: string, participantId: string, isMember: boolean }) => {
        if (isGuest && variables.participantId !== guestSession?.participantId) {
            toast({ title: "Ação não permitida", description: 'Você só pode alterar sua própria participação nos itens.', variant: "destructive" });
            return;
        }
        mutations.toggleItemParticipantMutation.mutate(variables);
    }
  };

  return {
    rachadinhaData,
    isLoadingRachadinha: isLoading,
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
    addParticipantMutation: mutations.addParticipantMutation,
    bulkAddParticipantsMutation: wrapMutation(mutations.bulkAddParticipantsMutation, !isGuest, 'Convidados não podem adicionar contatos.'),
    removeParticipantMutation,
    addItemMutation: mutations.addItemMutation,
    removeItemMutation,
    toggleItemParticipantMutation,
    handleAddParticipant,
    handleAddItem,
    isGuest,
  };
};

export default useRachadinha;
