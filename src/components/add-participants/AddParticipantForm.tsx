
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserPlus } from 'lucide-react';
import { UseMutationResult } from '@tanstack/react-query';

interface AddParticipantFormProps {
  newParticipantName: string;
  setNewParticipantName: (name: string) => void;
  onAddParticipant: () => void;
  addParticipantMutation: UseMutationResult<unknown, Error, string, unknown>;
}

const AddParticipantForm = ({
  newParticipantName,
  setNewParticipantName,
  onAddParticipant,
  addParticipantMutation,
}: AddParticipantFormProps) => {
  return (
    <div className="flex gap-2">
      <Input
        type="text"
        value={newParticipantName}
        onChange={(e) => setNewParticipantName(e.target.value)}
        placeholder="Nome do participante"
        onKeyPress={(e) => e.key === 'Enter' && onAddParticipant()}
        disabled={addParticipantMutation.isPending}
      />
      <Button onClick={onAddParticipant} disabled={addParticipantMutation.isPending}>
        <UserPlus className="mr-2 h-4 w-4" />
        {addParticipantMutation.isPending ? 'Adicionando...' : 'Adicionar'}
      </Button>
    </div>
  );
};

export default AddParticipantForm;
