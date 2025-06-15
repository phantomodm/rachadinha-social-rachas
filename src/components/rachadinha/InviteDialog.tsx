
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import QRCode from 'qrcode.react';
import { useToast } from '@/components/ui/use-toast';

interface InviteDialogProps {
  rachadinhaId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const InviteDialog = ({ rachadinhaId, open, onOpenChange }: InviteDialogProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = React.useState(false);
  const inviteLink = `${window.location.origin}/rachadinha/${rachadinhaId}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    toast({ title: 'Link copiado!' });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Convidar para a Rachadinha</DialogTitle>
          <DialogDescription>
            Qualquer pessoa com este link poderá ver esta rachadinha. Para adicionar itens, eles precisarão que você os adicione como participantes.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center gap-4 py-4">
          <QRCode value={inviteLink} size={128} bgColor="hsl(var(--background))" fgColor="hsl(var(--foreground))" />
          <div className="flex w-full items-center space-x-2">
            <Input id="link" defaultValue={inviteLink} readOnly />
            <Button type="button" size="icon" onClick={copyToClipboard}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InviteDialog;
