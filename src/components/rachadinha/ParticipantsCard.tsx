
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, Users } from 'lucide-react';
import { RachadinhaData } from '@/lib/api';
import { UseMutationResult } from '@tanstack/react-query';
import EditableParticipantList from './EditableParticipantList';
import InvitationOptions from '../add-participants/InvitationOptions';
import InviteDialog from './InviteDialog';
import AddFromContactsDialog from './AddFromContactsDialog';
import { GuestSession } from '@/hooks/useGuest';

interface ParticipantsCardProps {
  rachadinhaData: RachadinhaData;
  newParticipantName: string;
  setNewParticipantName: (name: string) => void;
  handleAddParticipant: () => void;
  addParticipantMutation: UseMutationResult<unknown, Error, string, unknown>;
  removeParticipantMutation: UseMutationResult<unknown, Error, string, unknown>;
  updateParticipantMutation: UseMutationResult<unknown, Error, { participantId: string; name: string; }, unknown>;
  bulkAddParticipantsMutation: UseMutationResult<unknown, Error, string[], unknown>;
  isGuest: boolean;
  guestSession?: GuestSession;
  handleLogoutGuest?: () => void;
}

const ParticipantsCard = ({
  rachadinhaData,
  newParticipantName,
  setNewParticipantName,
  handleAddParticipant,
  addParticipantMutation,
  removeParticipantMutation,
  updateParticipantMutation,
  bulkAddParticipantsMutation,
  isGuest,
  guestSession,
  handleLogoutGuest,
}: ParticipantsCardProps) => {
  const [isInviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [isContactsDialogOpen, setContactsDialogOpen] = useState(false);

  const { id, name, participants } = rachadinhaData;

  const handleWhatsAppInvite = () => {
    const inviteLink = `${window.location.origin}/rachadinha/${id}`;
    const message = `Você foi convidado para a rachadinha "${name}"! Entre pelo link: ${inviteLink}`;

    if (navigator.share) {
        navigator.share({
            title: `Convite para Rachadinha: ${name}`,
            text: `Entre na rachadinha "${name}".`,
            url: inviteLink,
        }).catch((error) => console.log('Erro ao compartilhar', error));
    } else {
        const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    }
  };
  
  const handleAddFromContacts = (names: string[]) => {
    bulkAddParticipantsMutation.mutate(names, {
      onSuccess: () => {
        setContactsDialogOpen(false);
      },
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Users className="text-primary"/>Galera da Rachadinha</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <EditableParticipantList 
            participants={participants} 
            removeParticipantMutation={removeParticipantMutation}
            updateParticipantMutation={updateParticipantMutation}
            isGuest={isGuest}
          />

          {isGuest && guestSession && handleLogoutGuest && (
            <div className="p-3 bg-muted/50 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">
                    Participando como convidado: <strong>{guestSession.name}</strong>
                </p>
                <Button
                    variant="link"
                    className="text-primary h-auto p-0 text-sm"
                    onClick={handleLogoutGuest}
                >
                    Sair da rachadinha
                </Button>
            </div>
          )}

          {!isGuest && (
            <>
              <div className="flex gap-2">
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
              
              <InvitationOptions
                onOpenContacts={() => setContactsDialogOpen(true)}
                onWhatsAppInvite={handleWhatsAppInvite}
                onOpenInviteDialog={() => setInviteDialogOpen(true)}
              />
            </>
          )}
        </CardContent>
      </Card>

      <InviteDialog rachadinhaId={id} open={isInviteDialogOpen} onOpenChange={setInviteDialogOpen} />
      
      <AddFromContactsDialog 
        open={isContactsDialogOpen}
        onOpenChange={setContactsDialogOpen}
        existingParticipants={participants}
        onAddParticipants={handleAddFromContacts}
        isAdding={bulkAddParticipantsMutation.isPending}
      />
    </>
  );
};

export default ParticipantsCard;
