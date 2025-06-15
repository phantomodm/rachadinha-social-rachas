
import { supabase } from '@/integrations/supabase/client';
import type { VendorPixKey } from './types';

export const getPixKeysByVendorId = async (vendorId: string): Promise<VendorPixKey[]> => {
    const { data, error } = await supabase
        .from('vendor_pix_keys')
        .select('*')
        .eq('vendor_id', vendorId);

    if (error) {
        console.error("Error fetching vendor PIX keys:", error);
        throw error;
    }

    return data || [];
}

export const addPixKeyForVendor = async (pixKey: Omit<VendorPixKey, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
        .from('vendor_pix_keys')
        .insert(pixKey)
        .select()
        .single();

    if (error) {
        console.error("Error adding PIX key:", error);
        if (error.code === '23505') { // unique_violation
            throw new Error('This PIX key has already been added.');
        }
        throw error;
    }
    return data;
};
