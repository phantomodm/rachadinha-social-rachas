
import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { addParticipant, Participant } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Link } from 'react-router-dom';

interface JoinRachadinhaFormProps {
  rachadinhaId: string;
  rachadinhaName: string;
  onJoin: (participant: Participant) => void;
}

const JoinRachadinhaForm = ({ rachadinhaId, rachadinhaName, onJoin }: JoinRachadinhaFormProps) => {
  const [name, setName] = useState('');
  const { toast } = useToast();
  
  const addParticipantMutation = useMutation({
    mutationFn: (participantName: string) => addParticipant(rachadinhaId, participantName),
    onSuccess: (newParticipant) => {
      toast({ title: 'Bem-vindo(a)!', description: 'Você entrou na rachadinha.' });
      onJoin(newParticipant);
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao entrar', description: error.message, variant: 'destructive' });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      addParticipantMutation.mutate(name.trim());
    }
  };

  return (
    <div className="max-w-md mx-auto">
        <Card>
            <CardHeader>
                <CardTitle>Entrar na Rachadinha</CardTitle>
                <CardDescription>Você foi convidado para "{rachadinhaName}". Para participar, digite seu nome abaixo.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        placeholder="Seu nome"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        disabled={addParticipantMutation.isPending}
                    />
                    <Button type="submit" className="w-full" disabled={addParticipantMutation.isPending}>
                        {addParticipantMutation.isPending ? 'Entrando...' : 'Entrar na Rachadinha'}
                    </Button>
                </form>
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">
                        Ou
                        </span>
                    </div>
                </div>
                <Button variant="outline" className="w-full" asChild>
                    <Link to="/auth">Fazer login ou criar conta</Link>
                </Button>
            </CardContent>
        </Card>
    </div>
  );
};

export default JoinRachadinhaForm;
