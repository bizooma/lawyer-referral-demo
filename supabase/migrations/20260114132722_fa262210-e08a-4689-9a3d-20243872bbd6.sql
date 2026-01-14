-- Create enum for demo roles
CREATE TYPE public.demo_role AS ENUM ('intake_specialist', 'program_admin');

-- Create enum for intake status
CREATE TYPE public.intake_status AS ENUM ('new', 'pending_match', 'matched', 'referred', 'closed', 'cancelled');

-- Create enum for practice areas
CREATE TYPE public.practice_area AS ENUM ('personal_injury', 'family_law', 'criminal_defense', 'estate_probate', 'immigration', 'business');

-- Create demo users table for one-click demo login
CREATE TABLE public.demo_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  role demo_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create attorneys table
CREATE TABLE public.attorneys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  firm_name TEXT,
  bar_number TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  practice_areas practice_area[] NOT NULL,
  counties TEXT[] NOT NULL,
  languages TEXT[] DEFAULT ARRAY['English'],
  capacity_status TEXT DEFAULT 'available' CHECK (capacity_status IN ('available', 'limited', 'at_capacity')),
  is_active BOOLEAN DEFAULT true,
  excluded_flags TEXT[] DEFAULT ARRAY[]::TEXT[],
  last_assigned_date TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create intakes table
CREATE TABLE public.intakes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_number TEXT UNIQUE NOT NULL,
  client_id TEXT UNIQUE NOT NULL,
  -- Caller info
  caller_name TEXT NOT NULL,
  caller_phone TEXT,
  caller_email TEXT,
  -- Matter details
  issue_date DATE,
  narrative TEXT,
  county TEXT NOT NULL,
  language_preference TEXT DEFAULT 'English',
  -- Case info
  area_of_law practice_area NOT NULL,
  urgency TEXT DEFAULT 'normal' CHECK (urgency IN ('low', 'normal', 'high', 'urgent')),
  -- Payment
  payment_amount DECIMAL(10,2),
  payment_method TEXT,
  payment_notes TEXT,
  -- Status
  status intake_status DEFAULT 'new',
  assigned_attorney_id UUID REFERENCES public.attorneys(id),
  referral_method TEXT,
  referral_sent_at TIMESTAMPTZ,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create audit trail table
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID REFERENCES public.intakes(id),
  attorney_id UUID REFERENCES public.attorneys(id),
  action TEXT NOT NULL,
  details JSONB,
  performed_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create matching rules table
CREATE TABLE public.matching_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name TEXT NOT NULL,
  description TEXT,
  weight INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create organization settings table
CREATE TABLE public.organization_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#1e3a5f',
  secondary_color TEXT DEFAULT '#64748b',
  disclaimer_text TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.demo_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attorneys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matching_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_settings ENABLE ROW LEVEL SECURITY;

-- Create public read policies for demo (all data is fictional demo data)
CREATE POLICY "Demo data is publicly readable" ON public.demo_users FOR SELECT USING (true);
CREATE POLICY "Attorneys are publicly readable" ON public.attorneys FOR SELECT USING (true);
CREATE POLICY "Intakes are publicly readable" ON public.intakes FOR SELECT USING (true);
CREATE POLICY "Audit logs are publicly readable" ON public.audit_logs FOR SELECT USING (true);
CREATE POLICY "Matching rules are publicly readable" ON public.matching_rules FOR SELECT USING (true);
CREATE POLICY "Organization settings are publicly readable" ON public.organization_settings FOR SELECT USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add triggers for updated_at
CREATE TRIGGER update_attorneys_updated_at
  BEFORE UPDATE ON public.attorneys
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_intakes_updated_at
  BEFORE UPDATE ON public.intakes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();