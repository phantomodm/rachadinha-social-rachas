
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FileText, CheckCircle } from 'lucide-react';
import { Participant } from '@/lib/api';

interface BillCardProps {
  participants: Participant[];
  calculation: {
    participantTotals: Record<string, number>;
    totalBill: number;
    totalServiceCharge: number;
    totalWithoutService: number;
  };
  paidStatus: Record<string, boolean>;
  togglePaidStatus: (participantId: string) => void;
  localServiceCharge: number;
  setLocalServiceCharge: (value: number) => void;
  serviceCharge: number;
}

const BillCard = ({
  participants,
  calculation,
  paidStatus,
  togglePaidStatus,
  localServiceCharge,
  setLocalServiceCharge,
  serviceCharge,
}: BillCardProps) => {
  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="text-primary"/>A Conta Final</CardTitle></CardHeader>
      <CardContent>
        <div className="mb-4">
          <Label htmlFor="service-charge">Taxa de Serviço (%)</Label>
          <Input id="service-charge" type="number" value={localServiceCharge} onChange={(e) => setLocalServiceCharge(Number(e.target.value))} className="w-24 mt-1" />
        </div>
        <div className="space-y-2">
          {participants.map(p => (
            <div key={p.id} className={`flex items-center justify-between p-3 rounded-lg transition-all ${paidStatus[p.id] ? 'bg-green-100 dark:bg-green-900/50' : 'bg-muted/50'}`}>
              <div>
                <p className={`font-semibold ${paidStatus[p.id] ? 'line-through' : ''}`}>{p.name}</p>
                <p className={`text-xl font-bold text-primary ${paidStatus[p.id] ? 'line-through' : ''}`}>R$ {(calculation.participantTotals[p.id] || 0).toFixed(2)}</p>
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
         <p className="text-sm">Subtotal: R$ {calculation.totalWithoutService.toFixed(2)}</p>
         <p className="text-sm">Serviço ({serviceCharge}%): R$ {calculation.totalServiceCharge.toFixed(2)}</p>
         <p className="text-2xl font-bold mt-2">Total da Conta: R$ {calculation.totalBill.toFixed(2)}</p>
      </CardFooter>
    </Card>
  );
};

export default BillCard;
