
import { Database } from '@/integrations/supabase/types';

export type Rachadinha = Database['public']['Tables']['rachadinhas']['Row'];
export type Participant = Database['public']['Tables']['participants']['Row'];
export type Item = Database['public']['Tables']['items']['Row'];
export type ItemParticipant = Database['public']['Tables']['item_participants']['Row'];
export type Vendor = Database['public']['Tables']['vendors']['Row'];
export type VendorPixKey = Database['public']['Tables']['vendor_pix_keys']['Row'];
export type AppSettings = {
    [key: string]: any;
};

export type ItemWithParticipants = Item & {
    item_participants: { participant_id: string }[]
};

export type RachadinhaData = Rachadinha & {
    participants: Participant[];
    items: ItemWithParticipants[];
    vendors: Vendor | null;
};

export type Contact = Database['public']['Tables']['contacts']['Row'];
