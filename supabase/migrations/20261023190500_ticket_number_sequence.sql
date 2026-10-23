-- Generate ticket numbers required by the existing tickets table.
-- Review/apply only after confirming the canonical Supabase project.
create sequence if not exists public.ticket_number_seq;
select setval('public.ticket_number_seq', greatest(coalesce((select max(ticket_number) from public.tickets), 0) + 1, 1), false);
alter table public.tickets alter column ticket_number set default nextval('public.ticket_number_seq');
grant usage, select on sequence public.ticket_number_seq to authenticated;
