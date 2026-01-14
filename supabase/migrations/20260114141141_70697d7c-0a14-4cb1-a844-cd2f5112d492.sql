-- Add new roles to the demo_role enum
ALTER TYPE public.demo_role ADD VALUE IF NOT EXISTS 'client';
ALTER TYPE public.demo_role ADD VALUE IF NOT EXISTS 'attorney';

-- Create client_profiles table
CREATE TABLE public.client_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  demo_user_id uuid REFERENCES public.demo_users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  phone text,
  address text,
  preferred_language text DEFAULT 'English',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create attorney_profiles table (links demo users to attorneys)
CREATE TABLE public.attorney_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  demo_user_id uuid REFERENCES public.demo_users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  attorney_id uuid REFERENCES public.attorneys(id) ON DELETE CASCADE NOT NULL UNIQUE,
  bio text,
  profile_photo_url text,
  accepting_referrals boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create referral_responses table for attorney responses
CREATE TYPE public.referral_status AS ENUM ('pending', 'accepted', 'declined', 'contacted');

CREATE TABLE public.referral_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id uuid REFERENCES public.intakes(id) ON DELETE CASCADE NOT NULL,
  attorney_id uuid REFERENCES public.attorneys(id) ON DELETE CASCADE NOT NULL,
  status public.referral_status DEFAULT 'pending',
  response_date timestamp with time zone,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(intake_id, attorney_id)
);

-- Add demo_user_id to intakes to link clients to their intakes
ALTER TABLE public.intakes ADD COLUMN demo_user_id uuid REFERENCES public.demo_users(id) ON DELETE SET NULL;

-- Enable RLS on new tables
ALTER TABLE public.client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attorney_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_responses ENABLE ROW LEVEL SECURITY;

-- Create read policies for demo data (matching existing pattern)
CREATE POLICY "Client profiles are publicly readable" ON public.client_profiles FOR SELECT USING (true);
CREATE POLICY "Attorney profiles are publicly readable" ON public.attorney_profiles FOR SELECT USING (true);
CREATE POLICY "Referral responses are publicly readable" ON public.referral_responses FOR SELECT USING (true);

-- Add updated_at triggers
CREATE TRIGGER update_client_profiles_updated_at
  BEFORE UPDATE ON public.client_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_attorney_profiles_updated_at
  BEFORE UPDATE ON public.attorney_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();