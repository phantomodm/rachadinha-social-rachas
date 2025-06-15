
import { supabase } from '@/integrations/supabase/client';
import type { RachadinhaData } from './types';

// RACHADINHAS
export const getRachadinhas = async (userId: string) => {
    const { data, error } = await supabase
        .from('rachadinhas')
        .select('id, name, created_at, status')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
};

export const getAllRachadinhas = async () => {
    const { data, error } = await supabase
        .from('rachadinhas')
        .select('id, name, created_at, status, user_id')
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
            items (*, item_participants(participant_id)),
            vendors (*)
        `)
        .eq('id', rachadinhaId)
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
    
    const { data: vendor, error: vendorError } = await supabase
        .from('vendors')
        .select('id')
        .ilike('name', name)
        .maybeSingle();

    if (vendorError) throw vendorError;

    const { data, error } = await supabase
        .from('rachadinhas')
        .insert({
            user_id: userId,
            name: name || 'Nova Rachadinha',
            latitude,
            longitude,
            vendor_id: vendor?.id || null,
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

export const updateRachadinhaStatus = async (rachadinhaId: string, status: 'active' | 'archived') => {
    const { data, error } = await supabase
        .from('rachadinhas')
        .update({ status })
        .eq('id', rachadinhaId)
        .select()
        .single();
    if (error) throw error;
    return data;
};
