-- Create chrono_lead_scores table for temporal lead scoring
CREATE TABLE IF NOT EXISTS public.chrono_lead_scores (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_id uuid REFERENCES contacts(id) ON DELETE CASCADE,
  base_score numeric NOT NULL DEFAULT 0,
  time_factors jsonb NOT NULL DEFAULT '{}',
  final_score numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_chrono_lead_scores_contact_id ON public.chrono_lead_scores(contact_id);
CREATE INDEX IF NOT EXISTS idx_chrono_lead_scores_final_score ON public.chrono_lead_scores(final_score DESC);
CREATE INDEX IF NOT EXISTS idx_chrono_lead_scores_updated_at ON public.chrono_lead_scores(updated_at DESC);

-- Enable RLS
ALTER TABLE public.chrono_lead_scores ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own chrono lead scores" ON public.chrono_lead_scores
  FOR SELECT USING (auth.uid() IN (
    SELECT user_id FROM user_profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can insert their own chrono lead scores" ON public.chrono_lead_scores
  FOR INSERT WITH CHECK (auth.uid() IN (
    SELECT user_id FROM user_profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can update their own chrono lead scores" ON public.chrono_lead_scores
  FOR UPDATE USING (auth.uid() IN (
    SELECT user_id FROM user_profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can delete their own chrono lead scores" ON public.chrono_lead_scores
  FOR DELETE USING (auth.uid() IN (
    SELECT user_id FROM user_profiles WHERE id = auth.uid()
  ));

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_chrono_lead_scores_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_chrono_lead_scores_updated_at
  BEFORE UPDATE ON public.chrono_lead_scores
  FOR EACH ROW
  EXECUTE FUNCTION update_chrono_lead_scores_updated_at(); 