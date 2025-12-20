import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

// Create client with ecommerce schema
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  schema: 'ecommerce'
});

// Create an admin client with service role key for privileged operations
export const supabaseAdmin = supabaseServiceRoleKey 
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      },
      schema: 'ecommerce'
    })
  : supabase;

// Utility function to format currency as UGX
export function formatCurrency(amount: number, currency: string = 'UGX'): string {
  return new Intl.NumberFormat('en-UG', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url?: string;
  featured?: boolean;
  sort_order?: number;
  created_at: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo_url: string;
  created_at: string;
}

export interface ProductNote {
  id: string;
  product_id: string;
  layer: 'top' | 'heart' | 'base';
  note: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  brand_id: string;
  category_id: string;
  description: string;
  short_description: string;
  concentration: string;
  year_launched: number | null;
  perfumer: string | null;
  price: number;
  compare_at_price: number | null;
  volume_ml: number;
  stock: number;
  featured: boolean;
  is_new: boolean;
  is_limited: boolean;
  image_url: string;
  gallery_urls: string[];
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  email: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  postal_code: string;
  country: string;
  created_at: string;
}

export interface Order {
  id: string;
  customer_id: string;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  total_amount: number;
  currency: string;
  payment_intent_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  volume_ml: number;
  created_at: string;
}