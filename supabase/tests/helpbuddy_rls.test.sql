-- Run after applying the HelpBuddy migration in a disposable/test Supabase database.
-- This file is an integration-test checklist in SQL form; it intentionally does not
-- create or modify user data in a production database.
begin;
select plan(6);
select has_table('public', 'helpbuddy_work_items', 'HelpBuddy work items table exists');
select has_table('public', 'helpbuddy_work_events', 'HelpBuddy work events table exists');
select ok((select relrowsecurity from pg_class where oid = 'public.helpbuddy_work_items'::regclass), 'RLS enabled on work items');
select ok((select relrowsecurity from pg_class where oid = 'public.helpbuddy_work_events'::regclass), 'RLS enabled on work events');
select ok(exists(select 1 from pg_policies where schemaname='public' and tablename='helpbuddy_work_items' and policyname='helpbuddy_work_items_read_scope'), 'Scoped read policy exists');
select ok(exists(select 1 from pg_policies where schemaname='public' and tablename='helpbuddy_work_events' and policyname='helpbuddy_work_events_insert_scope'), 'Scoped event insert policy exists');
select * from finish();
rollback;
