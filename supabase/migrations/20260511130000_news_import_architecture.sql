-- News sources + imported headlines (MVP: manual admin allowlist + RLS).
-- Future: RSS/scrape workers insert rows; dedupe via (dedupe_source_url, dedupe_title_key).

create table if not exists public.news_admin_allowlist (
  email text primary key
);

comment on table public.news_admin_allowlist is
  'Emails allowed to manage news_sources and imported_news via Supabase JWT claim auth.jwt()->>''email''. Insert rows via SQL Editor (service role).';

alter table public.news_admin_allowlist enable row level security;

create table if not exists public.news_sources (
  id uuid primary key default gen_random_uuid(),
  source_name text not null,
  source_url text not null,
  related_event_id text,
  sport text not null,
  enabled boolean not null default true,
  last_checked_at timestamptz,
  fetch_kind text not null default 'mock'
    check (fetch_kind in ('mock', 'rss', 'scrape')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists news_sources_source_url_unique
  on public.news_sources (lower(trim(source_url)));

comment on table public.news_sources is
  'Official crawl targets (homepage or RSS URL). fetch_kind reserves rss/scrape for future workers.';

comment on column public.news_sources.fetch_kind is 'mock | rss | scrape — MVP uses mock importer only.';

create table if not exists public.imported_news (
  id uuid primary key default gen_random_uuid(),
  news_source_id uuid references public.news_sources (id) on delete set null,
  title text not null,
  summary text not null,
  article_url text not null,
  dedupe_source_url text not null,
  dedupe_title_key text not null,
  published_at timestamptz not null,
  related_event_id text,
  sport text not null,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint imported_news_dedupe_unique unique (dedupe_source_url, dedupe_title_key)
);

comment on table public.imported_news is
  'Importer rows: short summaries only; article_url points to organiser site. Approve before public display.';

comment on column public.imported_news.article_url is 'External URL to the original announcement (not full article copy).';
comment on column public.imported_news.dedupe_source_url is 'Normalized base/source key paired with dedupe_title_key to prevent duplicates.';
comment on column public.imported_news.dedupe_title_key is 'Normalized title for dedupe (lowercase trimmed).';

create index if not exists imported_news_status_idx on public.imported_news (status);
create index if not exists imported_news_published_at_idx on public.imported_news (published_at desc);

-- Allowlist check (SECURITY DEFINER reads news_admin_allowlist; table has no user-facing policies).
create or replace function public.is_news_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.news_admin_allowlist a
    where lower(trim(a.email)) = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
      and trim(coalesce(auth.jwt() ->> 'email', '')) <> ''
  );
$$;

grant execute on function public.is_news_admin() to anon, authenticated;

alter table public.news_sources enable row level security;
alter table public.imported_news enable row level security;

drop policy if exists "imported_news_select_public" on public.imported_news;
create policy "imported_news_select_public"
  on public.imported_news for select
  to anon, authenticated
  using (status = 'approved');

drop policy if exists "imported_news_select_admin" on public.imported_news;
create policy "imported_news_select_admin"
  on public.imported_news for select
  to authenticated
  using (public.is_news_admin());

drop policy if exists "imported_news_insert_admin" on public.imported_news;
create policy "imported_news_insert_admin"
  on public.imported_news for insert
  to authenticated
  with check (public.is_news_admin());

drop policy if exists "imported_news_update_admin" on public.imported_news;
create policy "imported_news_update_admin"
  on public.imported_news for update
  to authenticated
  using (public.is_news_admin())
  with check (public.is_news_admin());

drop policy if exists "imported_news_delete_admin" on public.imported_news;
create policy "imported_news_delete_admin"
  on public.imported_news for delete
  to authenticated
  using (public.is_news_admin());

drop policy if exists "news_sources_all_admin" on public.news_sources;
create policy "news_sources_all_admin"
  on public.news_sources for all
  to authenticated
  using (public.is_news_admin())
  with check (public.is_news_admin());

grant select on public.imported_news to anon, authenticated;
grant insert, update, delete on public.imported_news to authenticated;

grant select, insert, update, delete on public.news_sources to authenticated;
