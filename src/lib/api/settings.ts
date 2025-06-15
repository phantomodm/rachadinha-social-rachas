
import { supabase } from '@/integrations/supabase/client';
import type { AppSettings } from './types';

export const getAppSettings = async (): Promise<AppSettings> => {
    const { data, error } = await supabase
        .from('app_settings')
        .select('key, value');

    if (error) throw error;
    
    const settings = data.reduce((acc, { key, value }) => {
        acc[key] = value;
        return acc;
    }, {} as AppSettings);
    
    return settings;
};

export const updateAppSetting = async (key: string, value: any) => {
    const { data, error } = await supabase
        .from('app_settings')
        .update({ value: value })
        .eq('key', key)
        .select()
        .single();
    if (error) throw error;
    return data;
};
