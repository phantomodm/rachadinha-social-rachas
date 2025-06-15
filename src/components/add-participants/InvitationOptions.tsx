
import React from 'react';
import { Button } from '@/components/ui/button';
import { BookUser, Share2, Link as LinkIcon } from 'lucide-react';

interface InvitationOptionsProps {
  onOpenContacts: () => void;
  onWhatsAppInvite: () => void;
  onOpenInviteDialog: () => void;
}

const InvitationOptions = ({
  onOpenContacts,
  onWhatsAppInvite,
  onOpenInviteDialog,
}: InvitationOptionsProps) => {
  return (
    <>
      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">Ou</span>
        </div>
      </div>

      <Button variant="outline" className="w-full" onClick={onOpenContacts}>
        <BookUser className="mr-2 h-4 w-4" />
        Adicionar dos Meus Contatos
      </Button>
      
      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">Ou convide de outras formas</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Button variant="outline" className="w-full" onClick={onWhatsAppInvite}>
          <Share2 className="mr-2 h-4 w-4" />
          Convidar via WhatsApp
        </Button>
        <Button variant="outline" className="w-full" onClick={onOpenInviteDialog}>
          <LinkIcon className="mr-2 h-4 w-4" />
          Link / QR Code
        </Button>
      </div>
    </>
  );
};

export default InvitationOptions;
