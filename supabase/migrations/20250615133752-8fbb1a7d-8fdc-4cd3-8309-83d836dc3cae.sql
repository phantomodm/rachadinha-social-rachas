
-- Step 1: Create an enum type for application roles if it doesn't exist
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Step 2: Create a table to assign roles to users if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role public.app_role NOT NULL,
    UNIQUE (user_id, role)
);

-- Step 3: Create or replace a security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

-- Step 4: Enable RLS and create policies for user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;
CREATE POLICY "Admins can manage user roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- Step 5: Create a table for global application settings if it doesn't exist
CREATE TABLE IF NOT EXISTS public.app_settings (
    key TEXT PRIMARY KEY,
    value JSONB
);

-- Step 6: Enable RLS and create policies for app_settings
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users can read settings" ON public.app_settings;
CREATE POLICY "Authenticated users can read settings" ON public.app_settings FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Admins can manage settings" ON public.app_settings;
CREATE POLICY "Admins can manage settings" ON public.app_settings FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Step 7: Insert the default rachadinha_fee, doing nothing if it already exists
INSERT INTO public.app_settings (key, value) VALUES ('rachadinha_fee', '1') ON CONFLICT (key) DO NOTHING;

-- Step 8: Enable RLS and policies for existing tables, dropping old policies first
-- RACHADINHAS
ALTER TABLE public.rachadinhas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage all rachadinhas" ON public.rachadinhas;
CREATE POLICY "Admins can manage all rachadinhas" ON public.rachadinhas FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Users can manage their own rachadinhas" ON public.rachadinhas;
CREATE POLICY "Users can manage their own rachadinhas" ON public.rachadinhas FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- PARTICIPANTS
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage all participants" ON public.participants;
CREATE POLICY "Admins can manage all participants" ON public.participants FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Users can manage participants in their rachadinhas" ON public.participants;
CREATE POLICY "Users can manage participants in their rachadinhas" ON public.participants FOR ALL USING ( (SELECT r.user_id FROM public.rachadinhas r WHERE r.id = rachadinha_id) = auth.uid() OR public.has_role(auth.uid(), 'admin') ) WITH CHECK ( (SELECT r.user_id FROM public.rachadinhas r WHERE r.id = rachadinha_id) = auth.uid() OR public.has_role(auth.uid(), 'admin') );

-- ITEMS
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage all items" ON public.items;
CREATE POLICY "Admins can manage all items" ON public.items FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Users can manage items in their rachadinhas" ON public.items;
CREATE POLICY "Users can manage items in their rachadinhas" ON public.items FOR ALL USING ( (SELECT r.user_id FROM public.rachadinhas r WHERE r.id = rachadinha_id) = auth.uid() OR public.has_role(auth.uid(), 'admin') ) WITH CHECK ( (SELECT r.user_id FROM public.rachadinhas r WHERE r.id = rachadinha_id) = auth.uid() OR public.has_role(auth.uid(), 'admin') );

-- ITEM_PARTICIPANTS
ALTER TABLE public.item_participants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage all item_participants" ON public.item_participants;
CREATE POLICY "Admins can manage all item_participants" ON public.item_participants FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Users can manage item_participants in their rachadinhas" ON public.item_participants;
CREATE POLICY "Users can manage item_participants in their rachadinhas" ON public.item_participants FOR ALL USING ( (SELECT r.user_id FROM public.items i JOIN public.rachadinhas r ON i.rachadinha_id = r.id WHERE i.id = item_id) = auth.uid() OR public.has_role(auth.uid(), 'admin') ) WITH CHECK ( (SELECT r.user_id FROM public.items i JOIN public.rachadinhas r ON i.rachadinha_id = r.id WHERE i.id = item_id) = auth.uid() OR public.has_role(auth.uid(), 'admin') );

-- CONTACTS
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own contacts" ON public.contacts;
CREATE POLICY "Users can manage their own contacts" ON public.contacts FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
