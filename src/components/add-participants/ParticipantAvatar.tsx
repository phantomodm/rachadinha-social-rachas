
import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { Participant } from '@/lib/api';

interface ParticipantAvatarProps {
  participant: Participant;
  onRemove: (id: string) => void;
  isRemoving: boolean;
}

const getInitials = (name: string) => {
  const names = name.split(' ');
  if (names.length > 1 && names[0] && names[names.length - 1]) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const ParticipantAvatar = ({ participant, onRemove, isRemoving }: ParticipantAvatarProps) => {
  return (
    <div key={participant.id} className="group relative animate-scale-in transition-all duration-300 hover:z-10 hover:scale-110">
      <Avatar>
        <AvatarFallback>{getInitials(participant.name)}</AvatarFallback>
      </Avatar>
      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-popover text-popover-foreground p-2 rounded-md shadow-lg text-sm z-10 whitespace-nowrap flex items-center gap-2">
        <span>{participant.name}</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => onRemove(participant.id)}
          disabled={isRemoving}
        >
          <Trash2 className="h-3 w-3 text-destructive" />
        </Button>
      </div>
    </div>
  );
};

export default ParticipantAvatar;
