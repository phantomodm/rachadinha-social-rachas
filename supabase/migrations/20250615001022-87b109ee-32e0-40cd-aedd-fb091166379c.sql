
-- Add a 'status' column to the 'rachadinhas' table to track whether a rachadinha is 'active' or 'archived'.
ALTER TABLE public.rachadinhas
ADD COLUMN status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived'));
