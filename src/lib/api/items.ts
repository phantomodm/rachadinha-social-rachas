import { supabase } from '@/integrations/supabase/client';

// ITEMS
export const addItem = async (rachadinhaId: string, name: string, price: number, participantIds: string[]) => {
    const { data: item, error: itemError } = await supabase
        .from('items')
        .insert({ rachadinha_id: rachadinhaId, name, price })
        .select()
        .single();

    if (itemError) throw itemError;
    if (!item) throw new Error("Failed to create item");

    if (participantIds.length > 0) {
        const links = participantIds.map(pid => ({ item_id: item.id, participant_id: pid }));
        const { error: linkError } = await supabase.from('item_participants').insert(links);
        if (linkError) {
            throw linkError;
        }
    }
    
    return item;
};

export const removeItem = async (itemId: string) => {
    const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', itemId);
    if (error) throw error;
};

export const toggleItemParticipant = async (itemId: string, participantId: string, isMember: boolean) => {
    if (isMember) {
        const { error } = await supabase
            .from('item_participants')
            .delete()
            .match({ item_id: itemId, participant_id: participantId });
        if (error) throw error;
    } else {
        const { error } = await supabase
            .from('item_participants')
            .insert({ item_id: itemId, participant_id: participantId });
        if (error) throw error;
    }
};

export const updateItem = async ({ itemId, name, price }: { itemId: string, name: string, price: number }) => {
    const { error } = await supabase
        .from('items')
        .update({ name, price })
        .eq('id', itemId);
    if (error) throw error;
};
