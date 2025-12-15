-- Remove authentication requirement for rooms table
-- WARNING: This allows ANYONE to add/edit/delete rooms without authentication

-- Drop existing RLS policies on rooms
DROP POLICY IF EXISTS "Admins can manage rooms" ON public.rooms;
DROP POLICY IF EXISTS "Everyone can view rooms" ON public.rooms;

-- Create new public policies that allow anyone to manage rooms
CREATE POLICY "Anyone can manage rooms"
ON public.rooms
FOR ALL
TO public
USING (true)
WITH CHECK (true);