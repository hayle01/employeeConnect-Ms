-- Run this ONCE in Supabase SQL Editor if you get:
--   "new row violates row-level security policy for table employees"
-- Cause: auth.users exists but public.profiles has no row for that user,
--        so is_authenticated_staff() is false.

-- 1) Backfill profiles for any auth user missing one (username from email local-part)
INSERT INTO public.profiles (id, username, role)
SELECT
  u.id,
  lower(split_part(u.email, '@', 1)),
  'admin'::text
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id)
ON CONFLICT (id) DO NOTHING;

-- If you have duplicate usernames from backfill, fix manually in Table Editor.

-- 2) Auto-create profile on new signups (so this does not happen again)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uname text;
  rrole text;
BEGIN
  uname := COALESCE(
    NULLIF(trim(NEW.raw_user_meta_data->>'username'), ''),
    lower(split_part(NEW.email, '@', 1))
  );
  rrole := COALESCE(NULLIF(NEW.raw_user_meta_data->>'role', ''), 'staff');
  IF rrole NOT IN ('admin', 'staff') THEN
    rrole := 'staff';
  END IF;

  INSERT INTO public.profiles (id, username, role)
  VALUES (NEW.id, uname, rrole::text)
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
