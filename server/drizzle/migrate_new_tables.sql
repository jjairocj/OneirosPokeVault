-- New tables added in Phase 2-6
-- Safe to run multiple times (IF NOT EXISTS)

CREATE TABLE IF NOT EXISTS public.decks (
  id serial PRIMARY KEY,
  user_id integer NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  format text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE (user_id, name)
);

CREATE TABLE IF NOT EXISTS public.deck_cards (
  id serial PRIMARY KEY,
  deck_id integer NOT NULL REFERENCES public.decks(id) ON DELETE CASCADE,
  card_id text NOT NULL,
  card_name text NOT NULL,
  card_image text,
  quantity integer DEFAULT 1 NOT NULL,
  is_basic_energy integer DEFAULT 0 NOT NULL,
  UNIQUE (deck_id, card_id)
);

CREATE TABLE IF NOT EXISTS public.lists (
  id serial PRIMARY KEY,
  user_id integer NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  list_type text NOT NULL,
  visibility text DEFAULT 'private' NOT NULL,
  share_slug text UNIQUE,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE (user_id, name)
);

CREATE TABLE IF NOT EXISTS public.list_cards (
  id serial PRIMARY KEY,
  list_id integer NOT NULL REFERENCES public.lists(id) ON DELETE CASCADE,
  card_id text NOT NULL,
  card_name text,
  card_image text,
  quantity integer DEFAULT 1 NOT NULL,
  notes text,
  UNIQUE (list_id, card_id)
);

CREATE TABLE IF NOT EXISTS public.price_snapshots (
  id serial PRIMARY KEY,
  card_id text NOT NULL,
  source text NOT NULL,
  price integer NOT NULL,
  currency text NOT NULL,
  snapshot_date timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.user_profiles (
  id serial PRIMARY KEY,
  user_id integer NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  display_name text,
  banner_image text,
  featured_cards text,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.card_notes (
  id serial PRIMARY KEY,
  user_id integer NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  card_id text NOT NULL,
  note text NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE (user_id, card_id)
);

CREATE TABLE IF NOT EXISTS public.payments (
  id serial PRIMARY KEY,
  user_id integer NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  currency text NOT NULL,
  provider text NOT NULL,
  status text DEFAULT 'pending' NOT NULL,
  external_id text,
  created_at timestamptz DEFAULT now() NOT NULL
);
