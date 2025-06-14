
ALTER TABLE public.rachadinhas
ADD COLUMN latitude numeric(10, 7),
ADD COLUMN longitude numeric(10, 7);

COMMENT ON COLUMN public.rachadinhas.latitude IS 'Latitude of the event location.';
COMMENT ON COLUMN public.rachadinhas.longitude IS 'Longitude of the event location.';
