
import { supabase } from '@/integrations/supabase/client';
import type { Vendor } from './types';

export const getVendorByUserId = async (userId: string): Promise<Vendor | null> => {
    const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

    if (error) {
        console.error("Error fetching vendor data:", error);
        throw error;
    }

    return data;
}

export const updateVendorDetails = async (vendorId: string, details: { name: string }) => {
    const { data, error } = await supabase
        .from('vendors')
        .update({ name: details.name })
        .eq('id', vendorId)
        .select()
        .single();

    if (error) {
        console.error("Error updating vendor details:", error);
        throw error;
    }

    return data;
};
