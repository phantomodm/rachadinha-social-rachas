
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FileText, CheckCircle, CreditCard, Copy, Share } from 'lucide-react';
import { Participant } from '@/lib/api';
import { formatCurrency } from '@/lib/formatters';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';

interface BillCardProps {
  rachadinhaName: string;
  participants: Participant[];
  calculation: {
    participantBreakdowns: Record<string, {
        individualItemsTotal: number;
        sharedItemsShare: number;
        subtotal: number;
        serviceChargePortion: number;
        rachadinhaFee: number;
        total: number;
    }>;
    totalBill: number;
    totalServiceCharge: number;
    totalWithoutService: number;
    totalRachadinhaFee: number;
  };
  paidStatus: Record<string, boolean>;
  togglePaidStatus: (participantId: string) => void;
  localServiceCharge: number;
  setLocalServiceCharge: (value: number) => void;
  serviceCharge: number;
}

const PixPaymentDialog = ({ participantName, amount }: { participantName: string, amount: number }) => {
    const { toast } = useToast();
    const pixKey = "Funcionalidade em desenvolvimento";

    const handleCopy = () => {
        navigator.clipboard.writeText(pixKey);
        toast({
            title: "Copiado!",
            description: "A chave Pix foi copiada para a área de transferência.",
        });
    }

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Pagar com Pix - {participantName}</DialogTitle>
            </DialogHeader>
            <div className="py-4 text-center space-y-4">
                <p>O pagamento via Pix ainda está sendo implementado.</p>
                <p>Por enquanto, você pode transferir para a chave abaixo:</p>
                
                <div className="p-4 bg-muted rounded-lg">
                    <p className="font-mono break-all">{pixKey}</p>
                </div>
                
                <Button onClick={handleCopy}><Copy className="mr-2 h-4 w-4" /> Copiar Chave</Button>

                <p className="text-2xl font-bold">{formatCurrency(amount)}</p>
            </div>
        </DialogContent>
    )
}

const BillCard = ({
  rachadinhaName,
  participants,
  calculation,
  paidStatus,
  togglePaidStatus,
  localServiceCharge,
  setLocalServiceCharge,
  serviceCharge,
}: BillCardProps) => {
  const { toast } = useToast();

  const handleShare = (participantName: string, breakdown: typeof calculation.participantBreakdowns[string]) => {
    const summary = `Resumo da sua conta na rachadinha "${rachadinhaName}":

- Itens individuais: ${formatCurrency(breakdown.individualItemsTotal)}
- Rateio de itens compartilhados: ${formatCurrency(breakdown.sharedItemsShare)}
- Subtotal: ${formatCurrency(breakdown.subtotal)}
- Taxa de Serviço (${serviceCharge}%): ${formatCurrency(breakdown.serviceChargePortion)}
- Taxa da Rachadinha: ${formatCurrency(breakdown.rachadinhaFee)}
--------------------
Total a pagar: ${formatCurrency(breakdown.total)}`.trim().replace(/^\s+/gm, '');

    if (navigator.share) {
      navigator.share({
        title: `Sua conta da rachadinha "${rachadinhaName}"`,
        text: summary,
      }).catch((error) => {
        console.log('Erro ao compartilhar', error);
        if (error.name !== 'AbortError') {
          navigator.clipboard.writeText(summary);
          toast({
            title: "Copiado!",
            description: "O resumo da conta foi copiado para a área de transferência.",
          });
        }
      });
    } else {
      navigator.clipboard.writeText(summary);
      toast({
        title: "Copiado!",
        description: "O resumo da conta foi copiado para a área de transferência.",
      });
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="text-primary"/>A Conta Final</CardTitle></CardHeader>
      <CardContent>
        <div className="mb-4">
          <Label htmlFor="service-charge">Taxa de Serviço (%)</Label>
          <Input id="service-charge" type="number" value={localServiceCharge} onChange={(e) => setLocalServiceCharge(Number(e.target.value))} className="w-24 mt-1" />
        </div>
        <Accordion type="multiple" className="w-full">
            {participants.map(p => {
                const breakdown = calculation.participantBreakdowns[p.id];
                if (!breakdown) return null;

                const isPaid = paidStatus[p.id];

                return (
                    <AccordionItem value={p.id} key={p.id}>
                        <AccordionTrigger className={`flex items-center justify-between p-3 rounded-lg transition-all text-left ${isPaid ? 'bg-green-100 dark:bg-green-900/50' : 'bg-muted/50'}`}>
                            <div className="flex-1">
                                <p className={`font-semibold ${isPaid ? 'line-through' : ''}`}>{p.name}</p>
                                <p className={`text-xl font-bold text-primary ${isPaid ? 'line-through' : ''}`}>{formatCurrency(breakdown.total)}</p>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="p-4 space-y-4 bg-muted/20">
                            <div className="space-y-1 text-sm">
                                <div className="flex justify-between"><span>Itens individuais:</span> <span>{formatCurrency(breakdown.individualItemsTotal)}</span></div>
                                <div className="flex justify-between"><span>Itens compartilhados:</span> <span>{formatCurrency(breakdown.sharedItemsShare)}</span></div>
                                <div className="flex justify-between border-t pt-1 mt-1"><strong>Subtotal:</strong> <strong>{formatCurrency(breakdown.subtotal)}</strong></div>
                                <div className="flex justify-between"><span>Taxa de Serviço:</span> <span>{formatCurrency(breakdown.serviceChargePortion)}</span></div>
                                <div className="flex justify-between"><span>Taxa da Rachadinha:</span> <span>{formatCurrency(breakdown.rachadinhaFee)}</span></div>
                            </div>
                            <div className="flex gap-2 justify-end">
                                <Button variant="outline" size="sm" onClick={() => handleShare(p.name, breakdown)}>
                                    <Share className="mr-2 h-4 w-4"/>Compartilhar
                                </Button>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm"><CreditCard className="mr-2 h-4 w-4"/>Pagar com Pix</Button>
                                    </DialogTrigger>
                                    <PixPaymentDialog participantName={p.name} amount={breakdown.total} />
                                </Dialog>

                                <Button variant={isPaid ? "secondary" : "default"} size="sm" onClick={() => togglePaidStatus(p.id)}>
                                    <CheckCircle className="mr-2 h-4 w-4"/>
                                    {isPaid ? 'Pago' : 'Marcar como pago'}
                                </Button>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                )
            })}
        </Accordion>
      </CardContent>
      <CardFooter className="flex flex-col items-start bg-muted/20 p-4 rounded-b-lg">
         <p className="text-sm">Subtotal: {formatCurrency(calculation.totalWithoutService)}</p>
         <p className="text-sm">Serviço ({serviceCharge}%): {formatCurrency(calculation.totalServiceCharge)}</p>
         <p className="text-sm">Taxas da Rachadinha: {formatCurrency(calculation.totalRachadinhaFee)}</p>
         <p className="text-2xl font-bold mt-2">Total da Conta: {formatCurrency(calculation.totalBill)}</p>
      </CardFooter>
    </Card>
  );
};

export default BillCard;
