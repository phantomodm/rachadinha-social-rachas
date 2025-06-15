
-- Update the function that handles new user creation to also save the avatar URL provided by auth providers like Google.
-- This will not affect existing users, but new users signing up with Google will get their avatar automatically.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url')
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url;
  RETURN new;
END;
$$;

-- Create a new storage bucket for user avatars.
-- Using ON CONFLICT DO NOTHING to prevent errors if the bucket already exists.
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies to avoid conflicts, then recreate them.
-- This ensures the policies are correctly configured.
DROP POLICY IF EXISTS "Avatar images are publicly accessible." ON storage.objects;
CREATE POLICY "Avatar images are publicly accessible."
ON storage.objects FOR SELECT
USING ( bucket_id = 'avatars' );

DROP POLICY IF EXISTS "Users can upload their own avatar." ON storage.objects;
CREATE POLICY "Users can upload their own avatar."
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( auth.uid() = owner AND bucket_id = 'avatars' );

DROP POLICY IF EXISTS "Users can update their own avatar." ON storage.objects;
CREATE POLICY "Users can update their own avatar."
ON storage.objects FOR UPDATE
TO authenticated
USING ( auth.uid() = owner )
WITH CHECK ( bucket_id = 'avatars' );

DROP POLICY IF EXISTS "Users can delete their own avatar." ON storage.objects;
CREATE POLICY "Users can delete their own avatar."
ON storage.objects FOR DELETE
TO authenticated
USING ( auth.uid() = owner );
