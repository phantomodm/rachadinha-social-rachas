
-- Add columns to the vendors table to store Stripe and subscription info
ALTER TABLE public.vendors
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN stripe_customer_id TEXT,
ADD COLUMN subscription_status TEXT, -- e.g., 'active', 'canceled', 'past_due'
ADD COLUMN subscription_id TEXT UNIQUE,
ADD COLUMN subscription_tier TEXT, -- e.g., 'basic', 'advanced'
ADD COLUMN subscription_ends_at TIMESTAMPTZ;

-- Add a unique constraint on user_id to ensure one vendor profile per user.
ALTER TABLE public.vendors
ADD CONSTRAINT vendors_user_id_key UNIQUE (user_id);

-- Update RLS policy for vendors table to allow users to manage their own vendor profile
DROP POLICY IF EXISTS "Allow public read access to vendors" ON public.vendors;

CREATE POLICY "Allow users to read their own vendor data" ON public.vendors
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Allow users to insert their own vendor data" ON public.vendors
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Allow users to update their own vendor data" ON public.vendors
FOR UPDATE USING (user_id = auth.uid());


-- Create a table for vendor PIX keys
CREATE TABLE public.vendor_pix_keys (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
    pix_key_type TEXT NOT NULL, -- e.g., 'CPF/CNPJ', 'Email', 'Phone', 'Random'
    pix_key_value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (vendor_id, pix_key_value)
);

-- Enable RLS for the new table
ALTER TABLE public.vendor_pix_keys ENABLE ROW LEVEL SECURITY;

-- Policy to allow vendors to manage their own PIX keys
CREATE POLICY "Allow vendors to manage their own PIX keys"
ON public.vendor_pix_keys
FOR ALL
USING (EXISTS (
    SELECT 1 FROM public.vendors
    WHERE vendors.id = vendor_pix_keys.vendor_id AND vendors.user_id = auth.uid()
));
