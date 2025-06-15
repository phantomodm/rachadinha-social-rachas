
import React, { useState } from 'react';
import { Participant } from '@/lib/api';
import { UseMutationResult } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pen, Trash2, Check, X } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface EditableParticipantListProps {
  participants: Participant[];
  removeParticipantMutation: UseMutationResult<unknown, Error, string, unknown>;
  updateParticipantMutation: UseMutationResult<unknown, Error, { participantId: string; name: string; }, unknown>;
  isGuest: boolean;
}

const EditableParticipantList = ({ participants, removeParticipantMutation, updateParticipantMutation, isGuest }: EditableParticipantListProps) => {
  const [editingParticipantId, setEditingParticipantId] = useState<string | null>(null);
  const [participantName, setParticipantName] = useState('');

  const handleEditClick = (participant: Participant) => {
    setEditingParticipantId(participant.id);
    setParticipantName(participant.name);
  };

  const handleCancelEdit = () => {
    setEditingParticipantId(null);
    setParticipantName('');
  };

  const handleSaveEdit = (participantId: string) => {
    if (participantName.trim()) {
      updateParticipantMutation.mutate({ participantId, name: participantName.trim() }, {
        onSuccess: () => {
          handleCancelEdit();
        }
      });
    }
  };

  return (
    <div className="space-y-2">
      {participants.map(p => (
        <div key={p.id} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
          {editingParticipantId === p.id ? (
            <Input
              value={participantName}
              onChange={(e) => setParticipantName(e.target.value)}
              className="h-9"
              onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit(p.id)}
              disabled={updateParticipantMutation.isPending}
            />
          ) : (
            <span className="font-medium">{p.name}</span>
          )}
          {!isGuest && (
            <div className="flex items-center gap-1">
              {editingParticipantId === p.id ? (
                <>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleSaveEdit(p.id)} disabled={updateParticipantMutation.isPending}>
                    <Check className="h-4 w-4 text-green-500" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleCancelEdit}>
                    <X className="h-4 w-4 text-red-500" />
                  </Button>
                </>
              ) : (
                <>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEditClick(p)}>
                    <Pen className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="icon" variant="ghost" className="h-8 w-8" disabled={removeParticipantMutation.isPending && removeParticipantMutation.variables === p.id}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação não pode ser desfeita. Isso removerá permanentemente o participante e o desassociará de todos os itens.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => removeParticipantMutation.mutate(p.id)}>
                          Sim, remover
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default EditableParticipantList;
