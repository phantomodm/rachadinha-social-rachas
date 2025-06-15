
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { getContacts, addContact, removeContact, Contact } from '@/lib/api';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, Trash2, Users, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const ContactsPage = () => {
  const { session, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [newContactName, setNewContactName] = useState('');

  const { data: contacts, isLoading: isLoadingContacts } = useQuery({
    queryKey: ['contacts', session?.user?.id],
    queryFn: () => getContacts(session!.user.id),
    enabled: !!session,
  });

  const addContactMutation = useMutation({
    mutationFn: (name: string) => addContact(session!.user.id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts', session?.user?.id] });
      setNewContactName('');
      toast.success('Contato adicionado com sucesso!');
    },
    onError: (error: any) => {
      if (error.code === '23505') { // unique_violation
        toast.error('Erro ao adicionar contato.', { description: 'Este nome já existe na sua lista de contatos.' });
      } else {
        toast.error('Erro ao adicionar contato.', { description: error.message });
      }
    },
  });

  const removeContactMutation = useMutation({
    mutationFn: (contactId: string) => removeContact(contactId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts', session?.user?.id] });
      toast.success('Contato removido com sucesso!');
    },
    onError: (error: any) => {
      toast.error('Erro ao remover contato.', { description: error.message });
    },
  });

  const handleAddContact = () => {
    if (newContactName.trim()) {
      addContactMutation.mutate(newContactName.trim());
    }
  };

  if (authLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><p>Carregando...</p></div>;
  }
  
  if (!session) {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Header />
            <main className="container mx-auto px-4 py-8 text-center">
              <Card className="max-w-md mx-auto">
                <CardHeader>
                  <CardTitle>Acesso Restrito</CardTitle>
                  <CardDescription>Você precisa estar logado para gerenciar seus contatos.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild><Link to="/auth">Fazer Login</Link></Button>
                </CardContent>
              </Card>
            </main>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Users className="text-primary"/>
                Meus Contatos
              </CardTitle>
              <CardDescription>Gerencie sua lista de contatos para facilitar a criação de rachadinhas.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-6">
                <Input
                  type="text"
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  placeholder="Nome do novo contato"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddContact()}
                  disabled={addContactMutation.isPending}
                />
                <Button onClick={handleAddContact} disabled={addContactMutation.isPending}>
                  {addContactMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <UserPlus className="mr-2 h-4 w-4" />
                  )}
                  Adicionar
                </Button>
              </div>

              {isLoadingContacts ? (
                <div className="text-center p-4">Carregando contatos...</div>
              ) : contacts && contacts.length > 0 ? (
                <div className="space-y-2">
                  {contacts.map((contact: Contact) => (
                    <div key={contact.id} className="flex items-center justify-between bg-muted/50 p-2 rounded-md animate-fade-in">
                      <span>{contact.name}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeContactMutation.mutate(contact.id)}
                        disabled={removeContactMutation.isPending && removeContactMutation.variables === contact.id}
                      >
                        {removeContactMutation.isPending && removeContactMutation.variables === contact.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-destructive"/>}
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground p-4 border-dashed border rounded-md">
                  Sua lista de contatos está vazia.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ContactsPage;
