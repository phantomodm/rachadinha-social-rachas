
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, ArrowRight } from 'lucide-react';
import useRachadinha from '@/hooks/useRachadinha';
import InviteDialog from '@/components/rachadinha/InviteDialog';
import AddFromContactsDialog from '@/components/rachadinha/AddFromContactsDialog';
import ParticipantList from '@/components/add-participants/ParticipantList';
import AddParticipantForm from '@/components/add-participants/AddParticipantForm';
import InvitationOptions from '@/components/add-participants/InvitationOptions';
import LoadingState from '@/components/add-participants/LoadingState';
import ErrorState from '@/components/add-participants/ErrorState';

const AddParticipantsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isInviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [isContactsDialogOpen, setContactsDialogOpen] = useState(false);

  const {
    rachadinhaData,
    isLoadingRachadinha,
    newParticipantName,
    setNewParticipantName,
    handleAddParticipant,
    addParticipantMutation,
    removeParticipantMutation,
    bulkAddParticipantsMutation,
  } = useRachadinha(id!);

  const handleWhatsAppInvite = () => {
    if (!rachadinhaData) return;
    const inviteLink = `${window.location.origin}/rachadinha/${id}`;
    const message = `Você foi convidado para a rachadinha "${rachadinhaData.name}"! Entre pelo link: ${inviteLink}`;

    if (navigator.share) {
        navigator.share({
            title: `Convite para Rachadinha: ${rachadinhaData.name}`,
            text: `Entre na rachadinha "${rachadinhaData.name}".`,
            url: inviteLink,
        }).catch((error) => console.log('Erro ao compartilhar', error));
    } else {
        const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    }
  };

  if (isLoadingRachadinha) {
    return <LoadingState />;
  }

  if (!rachadinhaData) {
    return <ErrorState />;
  }

  const { participants } = rachadinhaData;

  const handleAddFromContacts = (names: string[]) => {
    bulkAddParticipantsMutation.mutate(names, {
      onSuccess: () => {
        setContactsDialogOpen(false);
      },
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2"><Users className="text-primary"/>Quem tá na Rachadinha?</CardTitle>
              <CardDescription>Adicione os participantes para começar a dividir a conta.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <ParticipantList participants={participants} removeParticipantMutation={removeParticipantMutation} />

              <AddParticipantForm
                newParticipantName={newParticipantName}
                setNewParticipantName={setNewParticipantName}
                onAddParticipant={handleAddParticipant}
                addParticipantMutation={addParticipantMutation}
              />
              
              <InvitationOptions
                onOpenContacts={() => setContactsDialogOpen(true)}
                onWhatsAppInvite={handleWhatsAppInvite}
                onOpenInviteDialog={() => setInviteDialogOpen(true)}
              />

              <div className="pt-4 flex justify-end">
                <Button onClick={() => navigate(`/rachadinha/${id}`)}>
                    Próximo
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>

            </CardContent>
          </Card>
        </div>
      </main>
      {id && <InviteDialog rachadinhaId={id} open={isInviteDialogOpen} onOpenChange={setInviteDialogOpen} />}
      {rachadinhaData && (
        <AddFromContactsDialog 
          open={isContactsDialogOpen}
          onOpenChange={setContactsDialogOpen}
          existingParticipants={participants}
          onAddParticipants={handleAddFromContacts}
          isAdding={bulkAddParticipantsMutation.isPending}
        />
      )}
    </div>
  );
};

export default AddParticipantsPage;
