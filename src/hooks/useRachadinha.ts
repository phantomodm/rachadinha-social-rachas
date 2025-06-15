
import { useEffect } from 'react';
import { useDebounce } from 'use-debounce';
import { useRachadinhaData } from './useRachadinhaData';
import { useRachadinhaMutations } from './useRachadinhaMutations';
import { useRachadinhaCalculation } from './useRachadinhaCalculation';
import { useRachadinhaState } from './useRachadinhaState';

const useRachadinha = (rachadinhaId: string) => {
  // 1. Data fetching
  const { rachadinhaData, appSettings, isLoading } = useRachadinhaData(rachadinhaId);

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
  const {
    serviceChargeMutation,
    addParticipantMutation,
    bulkAddParticipantsMutation,
    removeParticipantMutation,
    addItemMutation,
    removeItemMutation,
    toggleItemParticipantMutation,
  } = useRachadinhaMutations(rachadinhaId);

  // 4. Calculations
  const calculation = useRachadinhaCalculation(rachadinhaData, appSettings);
  
  // 5. Side Effects (Debounced Service Charge)
  const [debouncedServiceCharge] = useDebounce(localServiceCharge, 500);

  useEffect(() => {
    if (rachadinhaData && debouncedServiceCharge !== rachadinhaData.service_charge) {
        serviceChargeMutation.mutate(debouncedServiceCharge);
    }
  }, [debouncedServiceCharge, rachadinhaData, serviceChargeMutation]);

  // 6. Event Handlers
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
