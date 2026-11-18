-- Converted articles a user chose to keep. A snapshot taken at save time,
-- readable and writable only by its owner. One row per (user, url).
create table public.saved_articles (
  id uuid not null default gen_random_uuid() primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  url text not null,
  title text not null default '',
  author text not null default '',
  site text not null default '',
  markdown text not null,
  saved_at timestamptz not null default now(),
  unique (user_id, url)
);

create index saved_articles_user_saved_at_idx
  on public.saved_articles (user_id, saved_at desc);

alter table public.saved_articles enable row level security;

-- Table privileges for the Data API. Rows are still limited by the policies below.
grant select, insert, delete on public.saved_articles to authenticated;
-- Re-saving the same URL refreshes the snapshot (upsert -> update).
grant update (title, author, site, markdown, saved_at) on public.saved_articles to authenticated;

create policy "Owner can read own saved articles"
  on public.saved_articles for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Owner can save own articles"
  on public.saved_articles for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Owner can refresh own saved articles"
  on public.saved_articles for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Owner can delete own saved articles"
  on public.saved_articles for delete
  to authenticated
  using ((select auth.uid()) = user_id);
