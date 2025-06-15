
-- Create a table to store information about vendor restaurants
CREATE TABLE public.vendors (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    latitude NUMERIC,
    longitude NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security and allow anyone to view the vendors.
-- This is needed so the app can check if a restaurant is a partner.
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to vendors" ON public.vendors FOR SELECT USING (true);


-- Add columns to the rachadinhas table to link to a vendor and store a table number
ALTER TABLE public.rachadinhas
ADD COLUMN vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL,
ADD COLUMN table_number TEXT;
