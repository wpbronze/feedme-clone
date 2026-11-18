-- One profile per Auth user, readable and editable only by its owner.
create table public.profiles (
  id uuid not null references auth.users (id) on delete cascade primary key,
  display_name text not null default '' check (char_length(display_name) <= 50),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Table privileges for the Data API. Rows are still limited by the policies below.
-- Inserts come from the trigger and deletes from the cascade, so neither is granted.
grant select on public.profiles to authenticated;
grant update (display_name) on public.profiles to authenticated;

create policy "Owner can read own profile"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "Owner can update own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Create the profile when an Auth user is created.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$;

-- SECURITY DEFINER in an exposed schema must not be callable through the Data API.
revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Keep updated_at current (SECURITY INVOKER, runs as the updating user).
create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();
