-- Create profiles and solves tables

create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  name text,
  avatar_url text,
  created_at timestamptz default now()
);

create table if not exists solves (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  scramble text not null,
  solution text,
  time_ms int,
  image_path text,
  created_at timestamptz default now()
);
