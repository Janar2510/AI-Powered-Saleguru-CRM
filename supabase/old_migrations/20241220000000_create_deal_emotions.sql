-- Create deal_emotions table for Live Sentiment Replay™
CREATE TABLE IF NOT EXISTS public.deal_emotions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id uuid REFERENCES deals(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  source text NOT NULL CHECK (source IN ('email', 'call', 'chat', 'meeting', 'note')),
  content text NOT NULL,
  sentiment text NOT NULL CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  emotion text NOT NULL,
  score numeric NOT NULL CHECK (score >= 0 AND score <= 100),
  timestamp timestamptz DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_deal_emotions_deal_id ON public.deal_emotions(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_emotions_user_id ON public.deal_emotions(user_id);
CREATE INDEX IF NOT EXISTS idx_deal_emotions_timestamp ON public.deal_emotions(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_deal_emotions_sentiment ON public.deal_emotions(sentiment);
CREATE INDEX IF NOT EXISTS idx_deal_emotions_score ON public.deal_emotions(score DESC);

-- Enable RLS
ALTER TABLE public.deal_emotions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own deal emotions" ON public.deal_emotions
  FOR SELECT USING (auth.uid() IN (
    SELECT user_id FROM user_profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can insert their own deal emotions" ON public.deal_emotions
  FOR INSERT WITH CHECK (auth.uid() IN (
    SELECT user_id FROM user_profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can update their own deal emotions" ON public.deal_emotions
  FOR UPDATE USING (auth.uid() IN (
    SELECT user_id FROM user_profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can delete their own deal emotions" ON public.deal_emotions
  FOR DELETE USING (auth.uid() IN (
    SELECT user_id FROM user_profiles WHERE id = auth.uid()
  ));

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_deal_emotions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.timestamp = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_deal_emotions_updated_at
  BEFORE UPDATE ON public.deal_emotions
  FOR EACH ROW
  EXECUTE FUNCTION update_deal_emotions_updated_at();

-- Insert sample data for demo
INSERT INTO public.deal_emotions (deal_id, user_id, source, content, sentiment, emotion, score, timestamp) VALUES
  ('deal-1', 'demo-user', 'email', 'Hi there! I am very excited about your product and would love to schedule a demo.', 'positive', 'excited', 85, now() - interval '5 days'),
  ('deal-1', 'demo-user', 'call', 'The pricing seems a bit high for our budget, but we are interested.', 'neutral', 'hesitant', 45, now() - interval '4 days'),
  ('deal-1', 'demo-user', 'meeting', 'This is exactly what we need! Let us move forward with the proposal.', 'positive', 'enthusiastic', 95, now() - interval '3 days'),
  ('deal-1', 'demo-user', 'chat', 'We need to think about this more before making a decision.', 'negative', 'cautious', 25, now() - interval '2 days'),
  ('deal-1', 'demo-user', 'email', 'Thank you for the demo! We are ready to proceed with the contract.', 'positive', 'confident', 90, now() - interval '1 day'),
  ('deal-2', 'demo-user', 'email', 'Your solution looks promising. Can we discuss the implementation timeline?', 'positive', 'interested', 75, now() - interval '6 days'),
  ('deal-2', 'demo-user', 'call', 'The features are great, but we have some concerns about the integration.', 'neutral', 'concerned', 40, now() - interval '5 days'),
  ('deal-2', 'demo-user', 'meeting', 'We love the product! Let us finalize the details.', 'positive', 'excited', 88, now() - interval '4 days'); 