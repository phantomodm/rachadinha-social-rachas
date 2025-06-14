
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { UserPlus, Trash2, PlusCircle, FileText, Users, DollarSign, Percent, CheckCircle } from 'lucide-react';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface Participant {
  id: number;
  name: string;
}

interface Item {
  id: number;
  name: string;
  price: number;
  participantIds: number[];
}

const RachadinhaCalculator = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [newParticipantName, setNewParticipantName] = useState('');
  const [items, setItems] = useState<Item[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [serviceCharge, setServiceCharge] = useState(10);
  const [paidStatus, setPaidStatus] = useState<Record<number, boolean>>({});

  const addParticipant = () => {
    if (newParticipantName.trim()) {
      setParticipants([...participants, { id: Date.now(), name: newParticipantName.trim() }]);
      setNewParticipantName('');
    }
  };

  const removeParticipant = (id: number) => {
    setParticipants(participants.filter(p => p.id !== id));
    setItems(items.map(item => ({
      ...item,
      participantIds: item.participantIds.filter(pId => pId !== id),
    })).filter(item => item.participantIds.length > 0));
  };
  
  const addItem = () => {
    if (newItemName.trim() && parseFloat(newItemPrice) > 0 && participants.length > 0) {
      setItems([...items, {
        id: Date.now(),
        name: newItemName.trim(),
        price: parseFloat(newItemPrice),
        participantIds: participants.map(p => p.id),
      }]);
      setNewItemName('');
      setNewItemPrice('');
    }
  };

  const removeItem = (id: number) => {
    setItems(items.filter(item => item.id !== id));
  };

  const toggleItemParticipant = (itemId: number, participantId: number) => {
    setItems(items.map(item => {
      if (item.id === itemId) {
        const participantIds = item.participantIds.includes(participantId)
          ? item.participantIds.filter(id => id !== participantId)
          : [...item.participantIds, participantId];
        // If no participants are left, you might want to handle this case, e.g., remove the item or prevent unchecking the last person.
        // For now, we'll allow it. The item won't be part of the calculation if no one is attached.
        return { ...item, participantIds };
      }
      return item;
    }));
  };

  const togglePaidStatus = (participantId: number) => {
    setPaidStatus(prev => ({ ...prev, [participantId]: !prev[participantId] }));
  };

  const calculation = useMemo(() => {
    const participantTotals: Record<number, number> = {};
    participants.forEach(p => participantTotals[p.id] = 0);

    items.forEach(item => {
      if (item.participantIds.length > 0) {
        const share = item.price / item.participantIds.length;
        item.participantIds.forEach(pId => {
          if (participantTotals[pId] !== undefined) {
            participantTotals[pId] += share;
          }
        });
      }
    });
    
    const totalBill = Object.values(participantTotals).reduce((sum, total) => sum + total, 0);
    const totalServiceCharge = totalBill * (serviceCharge / 100);

    const finalTotals: Record<number, number> = {};
    participants.forEach(p => {
        const individualTotal = participantTotals[p.id] || 0;
        if (totalBill > 0) {
            const proportionalServiceCharge = (individualTotal / totalBill) * totalServiceCharge;
            finalTotals[p.id] = individualTotal + proportionalServiceCharge;
        } else {
            finalTotals[p.id] = 0;
        }
    });

    return { participantTotals: finalTotals, totalBill: totalBill + totalServiceCharge, totalServiceCharge };
  }, [items, participants, serviceCharge]);
  
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Participants Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Users className="text-primary"/>Adicionar Galera</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input
              type="text"
              value={newParticipantName}
              onChange={(e) => setNewParticipantName(e.target.value)}
              placeholder="Nome do participante"
              onKeyPress={(e) => e.key === 'Enter' && addParticipant()}
            />
            <Button onClick={addParticipant}><UserPlus className="mr-2 h-4 w-4"/>Adicionar</Button>
          </div>
          <div className="space-y-2">
            {participants.map(p => (
              <div key={p.id} className="flex items-center justify-between bg-muted/50 p-2 rounded-md">
                <span>{p.name}</span>
                <Button variant="ghost" size="icon" onClick={() => removeParticipant(p.id)}>
                  <Trash2 className="h-4 w-4 text-destructive"/>
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Items Section */}
      {participants.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><DollarSign className="text-primary"/>Lançar Itens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-2 mb-4">
              <Input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="Nome do item"
              />
              <Input
                type="number"
                value={newItemPrice}
                onChange={(e) => setNewItemPrice(e.target.value)}
                placeholder="Preço (R$)"
              />
              <Button onClick={addItem} className="w-full md:w-auto"><PlusCircle className="mr-2 h-4 w-4"/>Lançar</Button>
            </div>
            <div className="space-y-4">
              {items.map(item => (
                <div key={item.id} className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-muted-foreground">R$ {item.price.toFixed(2)}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}>
                      <Trash2 className="h-4 w-4 text-destructive"/>
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {participants.map(p => (
                      <div key={p.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`item-${item.id}-participant-${p.id}`}
                          checked={item.participantIds.includes(p.id)}
                          onCheckedChange={() => toggleItemParticipant(item.id, p.id)}
                        />
                        <Label htmlFor={`item-${item.id}-participant-${p.id}`}>{p.name}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Section */}
      {items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileText className="text-primary"/>A Conta Final</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Label htmlFor="service-charge">Taxa de Serviço (%)</Label>
              <Input
                id="service-charge"
                type="number"
                value={serviceCharge}
                onChange={(e) => setServiceCharge(Number(e.target.value))}
                className="w-24 mt-1"
              />
            </div>
            <div className="space-y-2">
              {participants.map(p => (
                <div key={p.id} className={`flex items-center justify-between p-3 rounded-lg transition-all ${paidStatus[p.id] ? 'bg-green-100 dark:bg-green-900/50' : 'bg-muted/50'}`}>
                  <div>
                    <p className={`font-semibold ${paidStatus[p.id] ? 'line-through' : ''}`}>{p.name}</p>
                    <p className={`text-xl font-bold text-primary ${paidStatus[p.id] ? 'line-through' : ''}`}>
                      R$ {(calculation.participantTotals[p.id] || 0).toFixed(2)}
                    </p>
                  </div>
                  <Button variant={paidStatus[p.id] ? "secondary" : "default"} size="sm" onClick={() => togglePaidStatus(p.id)}>
                    <CheckCircle className="mr-2 h-4 w-4"/>
                    {paidStatus[p.id] ? 'Pago' : 'Marcar como pago'}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-start bg-muted/20 p-4 rounded-b-lg">
             <p className="text-sm">Subtotal: R$ {(calculation.totalBill - calculation.totalServiceCharge).toFixed(2)}</p>
             <p className="text-sm">Serviço ({serviceCharge}%): R$ {calculation.totalServiceCharge.toFixed(2)}</p>
             <p className="text-2xl font-bold mt-2">Total da Conta: R$ {calculation.totalBill.toFixed(2)}</p>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default RachadinhaCalculator;
