
-- 1. Extend role enum with 'attorney'
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'attorney';
