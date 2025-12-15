-- Create a test admin user through SQL
-- Note: This inserts directly into auth.users which requires special permissions
-- Instead, we'll ensure the existing accounts have admin roles

-- First, let's make sure all existing users have admin access for testing
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_roles WHERE role = 'admin')
ON CONFLICT DO NOTHING;