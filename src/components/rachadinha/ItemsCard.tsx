import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Trash2, DollarSign, Pen } from 'lucide-react';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ItemWithParticipants, Participant } from '@/lib/api';
import { UseMutationResult } from '@tanstack/react-query';
import { toast } from "sonner";

interface ItemsCardProps {
  items: ItemWithParticipants[];
  participants: Participant[];
  newItemName: string;
  setNewItemName: (name: string) => void;
  newItemPrice: string;
  setNewItemPrice: (price: string) => void;
  toggleItemParticipantMutation: UseMutationResult<unknown, Error, { itemId: string; participantId: string; isMember: boolean; }, unknown>;
  addItemMutation: UseMutationResult<unknown, Error, { name: string; price: number; participantIds: string[]; }, unknown>;
  removeItemMutation: UseMutationResult<unknown, Error, string, unknown>;
  updateItemMutation: UseMutationResult<unknown, Error, { itemId: string; name: string; price: number; }, unknown>;
}

const ItemsCard = ({
  items,
  participants,
  newItemName,
  setNewItemName,
  newItemPrice,
  setNewItemPrice,
  toggleItemParticipantMutation,
  addItemMutation,
  removeItemMutation,
  updateItemMutation,
}: ItemsCardProps) => {
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingItemName, setEditingItemName] = useState('');
  const [editingItemPrice, setEditingItemPrice] = useState('');

  const handleToggleSelectedParticipant = (participantId: string) => {
    setSelectedParticipants(prev =>
      prev.includes(participantId)
        ? prev.filter(id => id !== participantId)
        : [...prev, participantId]
    );
  };

  const handleConfirmAddItem = () => {
    if (!newItemName.trim() || !newItemPrice.trim()) {
      toast.error("Por favor, preencha o nome e o preço do item.");
      return;
    }
    const price = parseFloat(newItemPrice);
    if (isNaN(price)) {
      toast.error("O preço inserido não é válido.");
      return;
    }

    addItemMutation.mutate(
      { name: newItemName, price, participantIds: selectedParticipants },
      {
        onSuccess: () => {
          setSelectedParticipants([]);
        },
      }
    );
  };

  const handleEditClick = (item: ItemWithParticipants) => {
    setEditingItemId(item.id);
    setEditingItemName(item.name);
    setEditingItemPrice(String(item.price));
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditingItemName('');
    setEditingItemPrice('');
  };

  const handleSaveEdit = (itemId: string) => {
    const price = parseFloat(editingItemPrice);
    if (editingItemName.trim() && !isNaN(price) && price > 0) {
      updateItemMutation.mutate(
        { itemId, name: editingItemName.trim(), price },
        { onSuccess: handleCancelEdit }
      );
    } else {
        toast.error("Por favor, insira um nome e um preço válido para o item.");
    }
  };


  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><DollarSign className="text-primary"/>Lançar Itens</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-2">
            <Input type="text" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} placeholder="Nome do item" disabled={addItemMutation.isPending} />
            <Input type="number" value={newItemPrice} onChange={(e) => setNewItemPrice(e.target.value)} placeholder="Preço (R$)" disabled={addItemMutation.isPending}/>
          </div>
          
          {participants.length > 0 && (
            <div>
              <Label className="font-semibold">Quem vai rachar este item?</Label>
              <p className="text-sm text-muted-foreground mb-2">Selecione os participantes. Se ninguém for selecionado, o item será adicionado sem ninguém para rachar.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 py-2">
                {participants.map(p => (
                  <div key={p.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`new-item-participant-${p.id}`}
                      checked={selectedParticipants.includes(p.id)}
                      onCheckedChange={() => handleToggleSelectedParticipant(p.id)}
                      disabled={addItemMutation.isPending}
                    />
                    <Label htmlFor={`new-item-participant-${p.id}`}>{p.name}</Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button onClick={handleConfirmAddItem} className="w-full" disabled={addItemMutation.isPending}>
            <PlusCircle className="mr-2 h-4 w-4"/>
            {addItemMutation.isPending ? 'Lançando...' : 'Lançar Item'}
          </Button>
        </div>

        {items.length > 0 && <hr className="my-6" />}

        <div className="space-y-4">
          {items.map(item => (
            <div key={item.id} className="p-3 bg-muted/50 rounded-lg">
              {editingItemId === item.id ? (
                <div className="space-y-2">
                  <Input value={editingItemName} onChange={e => setEditingItemName(e.target.value)} placeholder="Nome do item" disabled={updateItemMutation.isPending}/>
                  <Input type="number" value={editingItemPrice} onChange={e => setEditingItemPrice(e.target.value)} placeholder="Preço (R$)" disabled={updateItemMutation.isPending}/>
                  <div className="flex justify-end gap-2 mt-2">
                      <Button variant="ghost" size="sm" onClick={handleCancelEdit}>Cancelar</Button>
                      <Button size="sm" onClick={() => handleSaveEdit(item.id)} disabled={updateItemMutation.isPending}>
                        {updateItemMutation.isPending && updateItemMutation.variables?.itemId === item.id ? 'Salvando...' : 'Salvar'}
                      </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-semibold break-all">{item.name}</p>
                      <p className="text-sm text-muted-foreground">R$ {Number(item.price).toFixed(2)}</p>
                    </div>
                    <div className="flex">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditClick(item)}>
                          <Pen className="h-4 w-4"/>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeItemMutation.mutate(item.id)} disabled={removeItemMutation.isPending && removeItemMutation.variables === item.id}>
                        <Trash2 className="h-4 w-4 text-destructive"/>
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {participants.map(p => {
                      const isMember = item.item_participants.some(ip => ip.participant_id === p.id);
                      return (
                      <div key={p.id} className="flex items-center space-x-2">
                        <Checkbox id={`item-${item.id}-participant-${p.id}`} checked={isMember} onCheckedChange={() => toggleItemParticipantMutation.mutate({ itemId: item.id, participantId: p.id, isMember })} />
                        <Label htmlFor={`item-${item.id}-participant-${p.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{p.name}</Label>
                      </div>
                    )})}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ItemsCard;
