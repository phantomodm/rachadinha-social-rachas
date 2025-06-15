import { supabase } from '@/integrations/supabase/client';

export const getUserProfile = async (userId: string) => {
    const { data, error } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
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

export const uploadAvatar = async (userId: string, file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

    if (uploadError) {
        throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);

    return publicUrl;
};

export const updateUserProfile = async (userId: string, updates: { full_name?: string; avatar_url?: string }) => {
    const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
        
    if (profileError) {
        throw profileError;
    }

    const { data: { user }, error: userError } = await supabase.auth.updateUser({
        data: {
            full_name: updates.full_name || profileData.full_name,
            avatar_url: updates.avatar_url || profileData.avatar_url,
        }
    });

    if (userError) {
        console.error("Error updating user metadata:", userError);
    }

    return profileData;
};
