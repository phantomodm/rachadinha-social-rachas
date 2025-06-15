
import React, { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { addParticipant, getUserProfile, Rachadinha } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

const RachadinhaNotifier = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!session) return;

    const handleInsert = async (payload: { new: Rachadinha }) => {
        const newRachadinha = payload.new;

        if (newRachadinha.user_id === session.user.id) {
            return;
        }

        const profile = await getUserProfile(newRachadinha.user_id);
        const creatorName = profile?.full_name || 'Alguém';

        const handleJoin = async () => {
            if (!session.user.user_metadata?.full_name) {
                toast.error("Não foi possível entrar na rachadinha.", { description: "Seu nome não está configurado."});
                return;
            }
            try {
                await addParticipant(newRachadinha.id, session.user.user_metadata.full_name);
                queryClient.invalidateQueries({ queryKey: ['rachadinhas'] });
                toast.success("Você entrou na rachadinha!");
                navigate(`/rachadinha/${newRachadinha.id}`);
            } catch (error) {
                console.error("Failed to join rachadinha:", error);
                toast.error("Erro ao entrar na rachadinha.");
            }
        };

        toast(`Alerta de Rachadinha!`, {
            description: `${creatorName} iniciou uma Rachadinha em ${newRachadinha.name}! Você está com ele(a)?`,
            action: {
                label: 'Sim, Entrar na Rachadinha!',
                onClick: () => handleJoin(),
            },
            cancel: {
                label: 'Não, Obrigado(a)',
                onClick: () => {},
            },
            duration: Infinity,
        });
    };

    const channel = supabase
      .channel('rachadinhas-notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'rachadinhas' },
        handleInsert
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session, navigate, queryClient]);

  return null;
};

export default RachadinhaNotifier;
