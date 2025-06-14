
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Trash2, DollarSign } from 'lucide-react';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ItemWithParticipants, Participant } from '@/lib/api';
import { UseMutationResult } from '@tanstack/react-query';

interface ItemsCardProps {
  items: ItemWithParticipants[];
  participants: Participant[];
  newItemName: string;
  setNewItemName: (name: string) => void;
  newItemPrice: string;
  setNewItemPrice: (price: string) => void;
  handleAddItem: () => void;
  toggleItemParticipantMutation: UseMutationResult<unknown, Error, { itemId: string; participantId: string; isMember: boolean; }, unknown>;
  addItemMutation: UseMutationResult<unknown, Error, { name: string; price: number; participantIds: string[]; }, unknown>;
  removeItemMutation: UseMutationResult<unknown, Error, string, unknown>;
}

const ItemsCard = ({
  items,
  participants,
  newItemName,
  setNewItemName,
  newItemPrice,
  setNewItemPrice,
  handleAddItem,
  toggleItemParticipantMutation,
  addItemMutation,
  removeItemMutation,
}: ItemsCardProps) => {
  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><DollarSign className="text-primary"/>Lançar Itens</CardTitle></CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-2 mb-4">
          <Input type="text" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} placeholder="Nome do item" disabled={addItemMutation.isPending} />
          <Input type="number" value={newItemPrice} onChange={(e) => setNewItemPrice(e.target.value)} placeholder="Preço (R$)" disabled={addItemMutation.isPending}/>
          <Button onClick={handleAddItem} className="w-full md:w-auto" disabled={addItemMutation.isPending}>
            <PlusCircle className="mr-2 h-4 w-4"/>
            {addItemMutation.isPending ? 'Lançando...' : 'Lançar'}
          </Button>
        </div>
        <div className="space-y-4">
          {items.map(item => (
            <div key={item.id} className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-muted-foreground">R$ {Number(item.price).toFixed(2)}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeItemMutation.mutate(item.id)} disabled={removeItemMutation.isPending && removeItemMutation.variables === item.id}>
                  <Trash2 className="h-4 w-4 text-destructive"/>
                </Button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {participants.map(p => {
                  const isMember = item.item_participants.some(ip => ip.participant_id === p.id);
                  return (
                  <div key={p.id} className="flex items-center space-x-2">
                    <Checkbox id={`item-${item.id}-participant-${p.id}`} checked={isMember} onCheckedChange={() => toggleItemParticipantMutation.mutate({ itemId: item.id, participantId: p.id, isMember })} />
                    <Label htmlFor={`item-${item.id}-participant-${p.id}`}>{p.name}</Label>
                  </div>
                )})}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ItemsCard;
