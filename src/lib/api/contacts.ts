
import { supabase } from '@/integrations/supabase/client';
import type { Contact } from './types';

// CONTACTS
export const getContacts = async (userId: string) => {
    const { data, error } = await supabase
        .from('contacts')
        .select('id, name, created_at')
        .eq('user_id', userId)
        .order('name', { ascending: true });

    if (error) throw error;
    return data;
};

export const addContact = async (userId: string, name: string) => {
    const { data, error } = await supabase
        .from('contacts')
        .insert({ user_id: userId, name })
        .select()
        .single();
    if (error) throw error;
    return data;
};

export const removeContact = async (contactId: string) => {
    const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', contactId);
    if (error) throw error;
};

export const bulkAddContacts = async (userId: string, names: string[]) => {
    const contactsToAdd = names.map(name => ({ user_id: userId, name }));
    
    const { data, error } = await supabase
        .from('contacts')
        .upsert(contactsToAdd, { onConflict: 'user_id, name', ignoreDuplicates: true })
        .select();

    if (error) throw error;
    return data;
};
