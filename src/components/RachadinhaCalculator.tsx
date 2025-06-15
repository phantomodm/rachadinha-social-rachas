
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import useRachadinha from '@/hooks/useRachadinha';
import ParticipantsCard from './rachadinha/ParticipantsCard';
import ItemsCard from './rachadinha/ItemsCard';
import BillCard from './rachadinha/BillCard';
import RachadinhaHeader from './rachadinha/RachadinhaHeader';

interface RachadinhaCalculatorProps {
  rachadinhaId: string;
  onBack: () => void;
}

const RachadinhaCalculator = ({ rachadinhaId, onBack }: RachadinhaCalculatorProps) => {
  const {
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
    bulkAddParticipantsMutation,
    removeParticipantMutation,
    addItemMutation,
    removeItemMutation,
    toggleItemParticipantMutation,
    handleAddParticipant,
    handleAddItem,
    isGuest,
  } = useRachadinha(rachadinhaId);


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

  const { participants, items, service_charge } = rachadinhaData;

  return (
    <div className="space-y-8 animate-fade-in">
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="mr-2 h-4 w-4" />Voltar para minhas rachadinhas</Button>
      
      <RachadinhaHeader rachadinhaData={rachadinhaData} totalBill={calculation.totalBill} />

      <ParticipantsCard 
        rachadinhaData={rachadinhaData}
        newParticipantName={newParticipantName}
        setNewParticipantName={setNewParticipantName}
        handleAddParticipant={handleAddParticipant}
        addParticipantMutation={addParticipantMutation}
        removeParticipantMutation={removeParticipantMutation}
        bulkAddParticipantsMutation={bulkAddParticipantsMutation}
        isGuest={isGuest}
      />
      
      {participants.length > 0 && (
        <ItemsCard 
          items={items}
          participants={participants}
          newItemName={newItemName}
          setNewItemName={setNewItemName}
          newItemPrice={newItemPrice}
          setNewItemPrice={setNewItemPrice}
          addItemMutation={addItemMutation}
          removeItemMutation={removeItemMutation}
          toggleItemParticipantMutation={toggleItemParticipantMutation}
        />
      )}

      {items.length > 0 && (
        <BillCard 
          participants={participants}
          calculation={calculation}
          paidStatus={paidStatus}
          togglePaidStatus={togglePaidStatus}
          localServiceCharge={localServiceCharge}
          setLocalServiceCharge={setLocalServiceCharge}
          serviceCharge={service_charge}
        />
      )}
    </div>
  );
};

export default RachadinhaCalculator;
