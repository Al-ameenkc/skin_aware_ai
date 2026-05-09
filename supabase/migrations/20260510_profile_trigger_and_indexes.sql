-- Ensure every new auth user has a profiles row (app can still upsert skin_type, etc.)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helpful indexes for RLS-filtered queries
create index if not exists analyses_user_id_created_at_idx
  on public.analyses (user_id, created_at desc);

create index if not exists recommendations_analysis_id_idx
  on public.recommendations (analysis_id);

create index if not exists chat_messages_user_id_created_at_idx
  on public.chat_messages (user_id, created_at desc);
