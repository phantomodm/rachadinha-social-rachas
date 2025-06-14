import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

export type Rachadinha = Database['public']['Tables']['rachadinhas']['Row'];
export type Participant = Database['public']['Tables']['participants']['Row'];
export type Item = Database['public']['Tables']['items']['Row'];
export type ItemParticipant = Database['public']['Tables']['item_participants']['Row'];

export type ItemWithParticipants = Item & {
    item_participants: { participant_id: string }[]
};

export type RachadinhaData = Rachadinha & {
    participants: Participant[];
    items: ItemWithParticipants[];
};

// RACHADINHAS
export const getRachadinhas = async (userId: string) => {
    const { data, error } = await supabase
        .from('rachadinhas')
        .select('id, name, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
};

export const getRachadinhaData = async (rachadinhaId: string): Promise<RachadinhaData | null> => {
    const { data, error } = await supabase
        .from('rachadinhas')
        .select(`
            *,
            participants (*),
            items (*, item_participants(participant_id))
        `)
        .eq('id', rachadinhaId)
        .order('created_at', { foreignTable: 'items', ascending: true })
        .order('name', { foreignTable: 'participants', ascending: true })
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null; // Not found is not an error
        throw error;
    }

    const rachadinhaData = data as unknown as RachadinhaData;

    rachadinhaData.items = rachadinhaData.items.map(item => ({
        ...item,
        item_participants: item.item_participants || []
    }));

    return rachadinhaData;
};

export const createRachadinha = async (payload: { userId: string, name: string, latitude?: number, longitude?: number }) => {
    const { userId, name, latitude, longitude } = payload;
    const { data, error } = await supabase
        .from('rachadinhas')
        .insert({
            user_id: userId,
            name: name || 'Nova Rachadinha',
            latitude,
            longitude
        })
        .select()
        .single();
    if (error) throw error;
    return data;
};

export const updateServiceCharge = async (rachadinhaId: string, serviceCharge: number) => {
    const { data, error } = await supabase
        .from('rachadinhas')
        .update({ service_charge: serviceCharge })
        .eq('id', rachadinhaId)
        .select()
        .single();
    if (error) throw error;
    return data;
};

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
