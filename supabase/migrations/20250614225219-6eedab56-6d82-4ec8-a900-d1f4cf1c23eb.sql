
-- Create rachadinhas table to store each bill splitting event
CREATE TABLE public.rachadinhas (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    service_charge numeric NOT NULL DEFAULT 10,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.rachadinhas IS 'Stores each bill splitting event, linked to a user.';

-- Create participants table
CREATE TABLE public.participants (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    rachadinha_id uuid NOT NULL REFERENCES public.rachadinhas(id) ON DELETE CASCADE,
    name text NOT NULL
);
COMMENT ON TABLE public.participants IS 'Stores participants for each rachadinha.';

-- Create items table
CREATE TABLE public.items (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    rachadinha_id uuid NOT NULL REFERENCES public.rachadinhas(id) ON DELETE CASCADE,
    name text NOT NULL,
    price numeric(10, 2) NOT NULL
);
COMMENT ON TABLE public.items IS 'Stores items for each rachadinha.';

-- Create a join table for items and participants
CREATE TABLE public.item_participants (
    item_id uuid NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
    participant_id uuid NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
    PRIMARY KEY (item_id, participant_id)
);
COMMENT ON TABLE public.item_participants IS 'Links items to the participants who shared them.';

-- RLS for rachadinhas table
ALTER TABLE public.rachadinhas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own rachadinhas" ON public.rachadinhas
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- RLS for participants table
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage participants of their own rachadinhas" ON public.participants
    FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.rachadinhas
        WHERE id = participants.rachadinha_id AND user_id = auth.uid()
    ));

-- RLS for items table
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage items of their own rachadinhas" ON public.items
    FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.rachadinhas
        WHERE id = items.rachadinha_id AND user_id = auth.uid()
    ));

-- RLS for item_participants table
ALTER TABLE public.item_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage item-participant links of their own rachadinhas" ON public.item_participants
    FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.items
        JOIN public.rachadinhas ON items.rachadinha_id = rachadinhas.id
        WHERE items.id = item_participants.item_id AND rachadinhas.user_id = auth.uid()
    ));
