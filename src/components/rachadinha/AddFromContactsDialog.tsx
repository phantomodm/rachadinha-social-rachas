
import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { getContacts, Contact, Participant } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2 } from 'lucide-react';

interface AddFromContactsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddParticipants: (names: string[]) => void;
  existingParticipants: Participant[];
  isAdding: boolean;
}

const AddFromContactsDialog = ({ open, onOpenChange, onAddParticipants, existingParticipants, isAdding }: AddFromContactsDialogProps) => {
  const { session } = useAuth();
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);

  const { data: contacts, isLoading } = useQuery({
    queryKey: ['contacts', session?.user?.id],
    queryFn: () => getContacts(session!.user.id),
    enabled: !!session && open,
  });

  const availableContacts = useMemo(() => {
    if (!contacts) return [];
    const existingNames = new Set(existingParticipants.map(p => p.name));
    return contacts.filter(c => !existingNames.has(c.name));
  }, [contacts, existingParticipants]);

  const handleToggleContact = (contactName: string) => {
    setSelectedContacts(prev =>
      prev.includes(contactName)
        ? prev.filter(name => name !== contactName)
        : [...prev, contactName]
    );
  };

  const handleAdd = () => {
    if (selectedContacts.length > 0) {
      onAddParticipants(selectedContacts);
      setSelectedContacts([]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar dos Contatos</DialogTitle>
          <DialogDescription>
            Selecione contatos para adicionar como participantes.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : availableContacts.length > 0 ? (
            <ScrollArea className="h-72">
              <div className="space-y-2">
                {availableContacts.map(contact => (
                  <div
                    key={contact.id}
                    className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted cursor-pointer"
                    onClick={() => handleToggleContact(contact.name)}
                  >
                    <Checkbox
                      id={`contact-${contact.id}`}
                      checked={selectedContacts.includes(contact.name)}
                      onCheckedChange={() => handleToggleContact(contact.name)}
                    />
                    <label
                      htmlFor={`contact-${contact.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {contact.name}
                    </label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <p className="text-center text-muted-foreground">
              Nenhum contato novo para adicionar.
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleAdd} disabled={selectedContacts.length === 0 || isAdding}>
            {isAdding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Adicionar Selecionados
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddFromContactsDialog;
