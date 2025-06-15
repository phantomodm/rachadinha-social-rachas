
import { supabase } from '@/integrations/supabase/client';

export const getUserProfile = async (userId: string) => {
    const { data, error } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', userId)
        .single();
    if (error) {
        console.error("Error fetching user profile:", error);
        return null;
    }
    return data;
};

export const getUserRoles = async (userId: string): Promise<string[]> => {
    const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

    if (error) {
        console.error("Error fetching user roles:", error);
        return [];
    }
    return data.map((r: { role: string }) => r.role);
};
