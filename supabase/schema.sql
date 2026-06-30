-- Categories
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  color text not null default '#e8d5c4',
  created_at timestamptz default now() not null
);

alter table categories enable row level security;
create policy "Users manage own categories" on categories
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Quotes
create table if not exists quotes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text,
  content text not null,
  source text,
  author text,
  page integer,
  memo text,
  category_id uuid references categories(id) on delete set null,
  image_url text,
  favorite boolean default false not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table quotes enable row level security;
create policy "Users manage own quotes" on quotes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Storage bucket for quote images
insert into storage.buckets (id, name, public) values ('quote-images', 'quote-images', true)
  on conflict do nothing;

create policy "Users upload own images" on storage.objects
  for insert with check (bucket_id = 'quote-images' and auth.role() = 'authenticated');

create policy "Public read images" on storage.objects
  for select using (bucket_id = 'quote-images');
