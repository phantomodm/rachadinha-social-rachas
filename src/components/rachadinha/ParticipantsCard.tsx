
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, Trash2, Users } from 'lucide-react';
import { Participant } from '@/lib/api';
import { UseMutationResult } from '@tanstack/react-query';

interface ParticipantsCardProps {
  participants: Participant[];
  newParticipantName: string;
  setNewParticipantName: (name: string) => void;
  handleAddParticipant: () => void;
  addParticipantMutation: UseMutationResult<unknown, Error, string, unknown>;
  removeParticipantMutation: UseMutationResult<unknown, Error, string, unknown>;
}

const ParticipantsCard = ({
  participants,
  newParticipantName,
  setNewParticipantName,
  handleAddParticipant,
  addParticipantMutation,
  removeParticipantMutation,
}: ParticipantsCardProps) => {
  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><Users className="text-primary"/>Adicionar Galera</CardTitle></CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Input 
            type="text" 
            value={newParticipantName} 
            onChange={(e) => setNewParticipantName(e.target.value)} 
            placeholder="Nome do participante" 
            onKeyPress={(e) => e.key === 'Enter' && handleAddParticipant()} 
            disabled={addParticipantMutation.isPending}
          />
          <Button onClick={handleAddParticipant} disabled={addParticipantMutation.isPending}>
            <UserPlus className="mr-2 h-4 w-4"/>
            {addParticipantMutation.isPending ? 'Adicionando...' : 'Adicionar'}
          </Button>
        </div>
        <div className="space-y-2">
          {participants.map(p => (
            <div key={p.id} className="flex items-center justify-between bg-muted/50 p-2 rounded-md">
              <span>{p.name}</span>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => removeParticipantMutation.mutate(p.id)} 
                disabled={removeParticipantMutation.isPending && removeParticipantMutation.variables === p.id}
              >
                <Trash2 className="h-4 w-4 text-destructive"/>
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ParticipantsCard;
