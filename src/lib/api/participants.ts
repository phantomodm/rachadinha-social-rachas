
import { supabase } from '@/integrations/supabase/client';

// PARTICIPANTS
export const addParticipant = async (rachadinhaId: string, name: string) => {
    const { data, error } = await supabase
        .from('participants')
        .insert({ rachadinha_id: rachadinhaId, name })
        .select()
        .single();
    if (error) throw error;
    return data;
};

export const removeParticipant = async (participantId: string) => {
    const { error } = await supabase
        .from('participants')
        .delete()
        .eq('id', participantId);
    if (error) throw error;
};
