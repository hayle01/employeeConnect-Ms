

-- Extensions
create extension if not exists "pgcrypto";

-- Profiles (linked to auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique not null,
  role text not null check (role in ('admin', 'staff')) default 'staff',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  emp_no text unique not null,
  name text not null,
  title_en text not null,
  title_local text not null,
  department text not null,
  mobile text not null,
  email text,
  national_id text not null,
  address text not null,
  district text not null,
  issue_date date not null,
  expire_date date not null,
  profile_image_url text,
  profile_image_path text,
  qr_image_url text,
  qr_image_path text,
  public_slug text unique not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.employee_history (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees (id) on delete cascade,
  action_type text not null check (action_type in ('update', 'renew')),
  emp_no text not null,
  name text not null,
  title_en text not null,
  title_local text not null,
  department text not null,
  mobile text not null,
  email text,
  national_id text not null,
  address text not null,
  district text not null,
  issue_date date not null,
  expire_date date not null,
  profile_image_url text,
  qr_image_url text,
  public_slug text not null,
  status_at_that_time text not null check (status_at_that_time in ('Active', 'Expired')),
  recorded_at timestamptz not null default now()
);

create index if not exists idx_employees_emp_no on public.employees (emp_no);
create index if not exists idx_employees_public_slug on public.employees (public_slug);
create index if not exists idx_employee_history_employee_id on public.employee_history (employee_id);

-- updated_at triggers
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_profiles_updated on public.profiles;
create trigger trg_profiles_updated
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists trg_employees_updated on public.employees;
create trigger trg_employees_updated
before update on public.employees
for each row execute function public.set_updated_at();

-- Role helpers (SECURITY DEFINER to avoid RLS recursion)
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

create or replace function public.is_authenticated_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('admin', 'staff')
  );
$$;

-- Public verification (safe fields only) — callable by anon
create or replace function public.get_public_employee_by_slug(p_slug text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  r record;
  st text;
begin
  select
    e.name,
    e.title_en,
    e.title_local,
    e.department,
    e.national_id,
    e.address,
    e.district,
    e.issue_date,
    e.expire_date,
    e.profile_image_url
  into r
  from public.employees e
  where e.public_slug = p_slug
  limit 1;

  if r is null then
    return null;
  end if;

  if r.expire_date >= current_date then
    st := 'Active';
  else
    st := 'Expired';
  end if;

  return jsonb_build_object(
    'name', r.name,
    'title_en', r.title_en,
    'title_local', r.title_local,
    'department', r.department,
    'national_id', r.national_id,
    'address', r.address,
    'district', r.district,
    'issue_date', r.issue_date,
    'expire_date', r.expire_date,
    'profile_image_url', r.profile_image_url,
    'status', st
  );
end;
$$;

grant execute on function public.get_public_employee_by_slug(text) to anon, authenticated;

-- RLS
alter table public.profiles enable row level security;
alter table public.employees enable row level security;
alter table public.employee_history enable row level security;

drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles
for select using (
  auth.uid() = id or public.is_admin()
);

drop policy if exists "employees_all_staff" on public.employees;
create policy "employees_all_staff" on public.employees
for all using (public.is_authenticated_staff())
with check (public.is_authenticated_staff());

drop policy if exists "history_all_staff" on public.employee_history;
create policy "history_all_staff" on public.employee_history
for all using (public.is_authenticated_staff())
with check (public.is_authenticated_staff());

-- Storage buckets (run once; adjust if buckets exist)
insert into storage.buckets (id, name, public)
values ('employee-profiles', 'employee-profiles', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('employee-qrcodes', 'employee-qrcodes', true)
on conflict (id) do nothing;

-- Storage policies: authenticated users can upload/read their org assets
drop policy if exists "profiles_read" on storage.objects;
create policy "profiles_read" on storage.objects
for select using (bucket_id = 'employee-profiles' and auth.role() = 'authenticated');

drop policy if exists "profiles_upload" on storage.objects;
create policy "profiles_upload" on storage.objects
for insert with check (bucket_id = 'employee-profiles' and auth.role() = 'authenticated');

drop policy if exists "profiles_update" on storage.objects;
create policy "profiles_update" on storage.objects
for update using (bucket_id = 'employee-profiles' and auth.role() = 'authenticated');

drop policy if exists "profiles_delete" on storage.objects;
create policy "profiles_delete" on storage.objects
for delete using (bucket_id = 'employee-profiles' and auth.role() = 'authenticated');

drop policy if exists "qr_read" on storage.objects;
create policy "qr_read" on storage.objects
for select using (bucket_id = 'employee-qrcodes');

drop policy if exists "qr_upload" on storage.objects;
create policy "qr_upload" on storage.objects
for insert with check (bucket_id = 'employee-qrcodes' and auth.role() = 'authenticated');

drop policy if exists "qr_update" on storage.objects;
create policy "qr_update" on storage.objects
for update using (bucket_id = 'employee-qrcodes' and auth.role() = 'authenticated');

drop policy if exists "qr_delete" on storage.objects;
create policy "qr_delete" on storage.objects
for delete using (bucket_id = 'employee-qrcodes' and auth.role() = 'authenticated');

-- Every signed-in user must have a profiles row or is_authenticated_staff() is false and employees RLS blocks inserts.
-- New auth users: auto-create profile (also run supabase/fix_profiles_and_rls.sql once to backfill existing users).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  uname text;
  rrole text;
begin
  uname := coalesce(
    nullif(trim(new.raw_user_meta_data->>'username'), ''),
    lower(split_part(new.email, '@', 1))
  );
  rrole := coalesce(nullif(new.raw_user_meta_data->>'role', ''), 'staff');
  if rrole not in ('admin', 'staff') then
    rrole := 'staff';
  end if;
  insert into public.profiles (id, username, role)
  values (new.id, uname, rrole)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();