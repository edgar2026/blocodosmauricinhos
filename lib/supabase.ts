import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase credentials missing. Check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Participant {
    id?: string;
    name: string;
    phone: string;
    email: string;
    cpf: string;
    unit: string;
    status: 'inscrito' | 'aguardando' | 'entregue' | 'cancelado';
    bracelet_delivered: boolean;
    delivery_at?: string;
    food_kg: number;
    food_type?: string;
    user_type?: string;
    admin_id?: string;
    notes?: string;
    created_at?: string;
}

export interface Attraction {
    id?: string;
    name: string;
    time: string;
    type: string;
    is_featured?: boolean;
    order?: number;
    created_at?: string;
}

export interface EventSettings {
    id: string;
    edition: string;
    year_label: string;
    hero_image_url: string;
    event_date: string;
    subtitle?: string;
    about_text?: string;
    primary_color: string;
    secondary_color: string;
    accent_color: string;
    title_main_color?: string;
    title_highlight_color?: string;
    title_main?: string;
    title_highlight?: string;
    solidarity_title?: string;
    solidarity_description?: string;
    vip_box_title?: string;
    vip_box_description?: string;
    schedule_title?: string;
    footer_address?: string;
    footer_instagram?: string;
    footer_phone?: string;
    footer_copyright?: string;
    show_hero?: boolean;
    show_solidarity?: boolean;
    show_vip_card?: boolean;
    show_solidarity_card?: boolean;
    show_schedule?: boolean;
    show_footer?: boolean;
    hero_cta_text?: string;
    updated_at?: string;
}
