
-- Create a table for user-specific contacts
CREATE TABLE public.contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_contact_name_for_user UNIQUE (user_id, name)
);

-- Enable Row Level Security (RLS) to protect user data
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow users to view their own contacts
CREATE POLICY "Users can view their own contacts"
  ON public.contacts
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Allow users to add new contacts for themselves
CREATE POLICY "Users can insert their own contacts"
  ON public.contacts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Allow users to update their own contacts
CREATE POLICY "Users can update their own contacts"
  ON public.contacts
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Allow users to delete their own contacts
CREATE POLICY "Users can delete their own contacts"
  ON public.contacts
  FOR DELETE
  USING (auth.uid() = user_id);
