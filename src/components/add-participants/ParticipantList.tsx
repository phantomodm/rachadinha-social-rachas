
import React from 'react';
import { Participant } from '@/lib/api';
import ParticipantAvatar from './ParticipantAvatar';
import { UseMutationResult } from '@tanstack/react-query';

interface ParticipantListProps {
  participants: Participant[];
  removeParticipantMutation: UseMutationResult<unknown, Error, string, unknown>;
}

const ParticipantList = ({ participants, removeParticipantMutation }: ParticipantListProps) => {
  if (participants.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground">Participantes</h3>
      <div className="flex flex-wrap items-center gap-4">
        {participants.map(p => (
          <ParticipantAvatar
            key={p.id}
            participant={p}
            onRemove={() => removeParticipantMutation.mutate(p.id)}
            isRemoving={removeParticipantMutation.isPending && removeParticipantMutation.variables === p.id}
          />
        ))}
      </div>
    </div>
  );
};

export default ParticipantList;
