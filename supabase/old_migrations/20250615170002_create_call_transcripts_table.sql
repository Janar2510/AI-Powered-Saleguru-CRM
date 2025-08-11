-- Create call_transcripts table
CREATE TABLE IF NOT EXISTS call_transcripts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  call_type VARCHAR(50) DEFAULT 'sales_call',
  duration INTEGER DEFAULT 0,
  audio_url TEXT,
  transcript TEXT,
  summary TEXT,
  key_points TEXT[],
  action_items TEXT[],
  sentiment VARCHAR(20) CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  deal_stage VARCHAR(30) CHECK (deal_stage IN ('qualification', 'discovery', 'proposal', 'negotiation', 'closing')),
  risk_level VARCHAR(20) CHECK (risk_level IN ('low', 'medium', 'high')),
  recommendations TEXT[],
  confidence_score DECIMAL(3,2) DEFAULT 0.0,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_call_transcripts_contact_id ON call_transcripts(contact_id);
CREATE INDEX IF NOT EXISTS idx_call_transcripts_deal_id ON call_transcripts(deal_id);
CREATE INDEX IF NOT EXISTS idx_call_transcripts_created_at ON call_transcripts(created_at);
CREATE INDEX IF NOT EXISTS idx_call_transcripts_status ON call_transcripts(status);

-- Add RLS policies
ALTER TABLE call_transcripts ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own call transcripts
CREATE POLICY "Users can view their own call transcripts" ON call_transcripts
  FOR SELECT USING (auth.uid() IN (
    SELECT user_id FROM contacts WHERE id = call_transcripts.contact_id
    UNION
    SELECT user_id FROM deals WHERE id = call_transcripts.deal_id
  ));

-- Allow users to insert their own call transcripts
CREATE POLICY "Users can insert their own call transcripts" ON call_transcripts
  FOR INSERT WITH CHECK (auth.uid() IN (
    SELECT user_id FROM contacts WHERE id = call_transcripts.contact_id
    UNION
    SELECT user_id FROM deals WHERE id = call_transcripts.deal_id
  ));

-- Allow users to update their own call transcripts
CREATE POLICY "Users can update their own call transcripts" ON call_transcripts
  FOR UPDATE USING (auth.uid() IN (
    SELECT user_id FROM contacts WHERE id = call_transcripts.contact_id
    UNION
    SELECT user_id FROM deals WHERE id = call_transcripts.deal_id
  ));

-- Allow users to delete their own call transcripts
CREATE POLICY "Users can delete their own call transcripts" ON call_transcripts
  FOR DELETE USING (auth.uid() IN (
    SELECT user_id FROM contacts WHERE id = call_transcripts.contact_id
    UNION
    SELECT user_id FROM deals WHERE id = call_transcripts.deal_id
  ));

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_call_transcripts_updated_at 
  BEFORE UPDATE ON call_transcripts 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 