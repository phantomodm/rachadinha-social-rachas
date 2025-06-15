
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, Users, ArrowRight, Link as LinkIcon, Trash2, BookUser } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import useRachadinha from '@/hooks/useRachadinha';
import { Skeleton } from '@/components/ui/skeleton';
import InviteDialog from '@/components/rachadinha/InviteDialog';
import AddFromContactsDialog from '@/components/rachadinha/AddFromContactsDialog';

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

  if (isLoadingRachadinha) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Skeleton className="h-96 w-full" />
          </div>
        </main>
      </div>
    );
  }

  if (!rachadinhaData) {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Header />
            <main className="container mx-auto px-4 py-8 text-center">
                <p>Não foi possível carregar os dados da rachadinha.</p>
                <Button asChild variant="link" className="mt-4"><Link to="/">Voltar para o início</Link></Button>
            </main>
      </div>
    )
  }

  const { participants } = rachadinhaData;

  const handleAddFromContacts = (names: string[]) => {
    bulkAddParticipantsMutation.mutate(names, {
      onSuccess: () => {
        setContactsDialogOpen(false);
      },
    });
  };

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1 && names[0] && names[names.length - 1]) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
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
              
              {participants.length > 0 && (
                <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Participantes</h3>
                    <div className="flex flex-wrap items-center gap-4">
                        {participants.map(p => (
                            <div key={p.id} className="group relative animate-scale-in transition-all duration-300 hover:z-10 hover:scale-110">
                                <Avatar>
                                    <AvatarFallback>{getInitials(p.name)}</AvatarFallback>
                                </Avatar>
                                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-popover text-popover-foreground p-2 rounded-md shadow-lg text-sm z-10 whitespace-nowrap flex items-center gap-2">
                                    <span>{p.name}</span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={() => removeParticipantMutation.mutate(p.id)}
                                        disabled={removeParticipantMutation.isPending && removeParticipantMutation.variables === p.id}
                                    >
                                        <Trash2 className="h-3 w-3 text-destructive" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
              )}

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

              <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Ou</span>
                </div>
              </div>

              <Button variant="outline" className="w-full" onClick={() => setContactsDialogOpen(true)}>
                <BookUser className="mr-2 h-4 w-4" />
                Adicionar dos Meus Contatos
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Ou</span>
                </div>
              </div>
              
              <Button variant="outline" className="w-full" onClick={() => setInviteDialogOpen(true)}>
                <LinkIcon className="mr-2 h-4 w-4" />
                Convidar por Link / QR Code
              </Button>

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
