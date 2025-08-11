-- Migration: Create social_mentions table for AI-powered Saleguru CRM
create table if not exists public.social_mentions (
  id uuid primary key default gen_random_uuid(),
  source text not null, -- e.g. 'twitter', 'linkedin', etc.
  mention_id text, -- platform-specific id
  author text,
  content text not null,
  mention_time timestamptz not null,
  sentiment text, -- e.g. 'positive', 'neutral', 'negative'
  url text, -- link to the mention
  contact_id uuid references public.contacts(id) on delete set null,
  company_id uuid references public.companies(id) on delete set null,
  extra jsonb, -- for any additional metadata
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes for performance
create index if not exists idx_social_mentions_mention_time on public.social_mentions(mention_time desc);
create index if not exists idx_social_mentions_source on public.social_mentions(source);
create index if not exists idx_social_mentions_contact_id on public.social_mentions(contact_id);
create index if not exists idx_social_mentions_company_id on public.social_mentions(company_id); 