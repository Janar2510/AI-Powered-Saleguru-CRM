# AI-Powered Lead Enrichment - Setup Guide

## Overview
This feature implements AI-powered lead enrichment that automatically fills in missing lead information using OpenAI's GPT-4. When a user enters partial lead information (name, email, company, or LinkedIn URL), the system can intelligently populate missing fields like job title, phone number, location, etc.

## Prerequisites
- Supabase project with Edge Functions enabled
- OpenAI API key
- SaleToru CRM application with existing leads functionality

## 1. Deploy the Supabase Edge Function

### Step 1: Set up Supabase CLI
```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF
```

### Step 2: Deploy the Edge Function
```bash
# Navigate to your project root
cd /path/to/AI-Powered-Saleguru-CRM

# Deploy the lead-enrichment function
supabase functions deploy lead-enrichment
```

### Step 3: Set Environment Variables
In your Supabase dashboard:

1. Go to **Settings** → **Edge Functions**
2. Add the following secrets:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `SUPABASE_URL`: Your Supabase project URL (usually auto-set)
   - `SUPABASE_SERVICE_ROLE_KEY`: Your service role key (usually auto-set)

```bash
# Or set via CLI
supabase secrets set OPENAI_API_KEY=your_openai_api_key_here
```

## 2. Test the Edge Function

### Using curl:
```bash
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/lead-enrichment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "name": "John Smith",
    "company": "TechCorp Inc"
  }'
```

Expected response:
```json
{
  "fullName": "John Smith",
  "jobTitle": "Senior Software Engineer",
  "linkedinUrl": "https://linkedin.com/in/johnsmith",
  "companyName": "TechCorp Inc",
  "location": "San Francisco, CA",
  "workEmail": "john.smith@techcorp.com",
  "phoneNumber": "+1-555-123-4567"
}
```

## 3. Frontend Integration

### Files Added/Modified:

1. **New Hook**: `src/hooks/useLeadEnrichment.ts`
   - Encapsulates enrichment logic
   - Manages loading states and errors
   - Calls the Supabase Edge Function

2. **Updated Component**: `src/pages/Leads.tsx`
   - Added "AI Enrich" buttons to Create and Edit Lead modals
   - Integrated enrichment functionality
   - Added proper error handling and success feedback

### Key Features:

- **Smart Button**: Purple "AI Enrich" button with Sparkles icon
- **Loading States**: Button shows "Enriching..." when processing
- **Error Handling**: Toast notifications for errors and success
- **Form Integration**: Automatically populates form fields with enriched data
- **Validation**: Requires at least one piece of input data (name, email, company, or LinkedIn)

## 4. How It Works

### User Flow:
1. User opens "Add New Lead" or "Edit Lead" modal
2. User enters partial information (e.g., just name and company)
3. User clicks "AI Enrich" button
4. System sends data to OpenAI via Supabase Edge Function
5. AI returns enriched data (job title, phone, LinkedIn, etc.)
6. Form fields are automatically populated with enriched information
7. User reviews and saves the completed lead

### Technical Flow:
```
Frontend (useLeadEnrichment hook)
    ↓
Supabase Edge Function (lead-enrichment)
    ↓
OpenAI GPT-4 API
    ↓
Enriched Data Response
    ↓
Form Field Population
```

## 5. Customization Options

### Modify Enrichment Fields
Edit `supabase/functions/lead-enrichment/index.ts` to change the fields returned by the AI:

```typescript
const systemPrompt = 
  "Always respond **only** with a JSON object containing the fields: " +
  "fullName, jobTitle, linkedinUrl, companyName, location, workEmail, phoneNumber, department, yearsOfExperience. " +
  // Add more fields as needed
```

### Adjust AI Model
Change the OpenAI model in the Edge Function:

```typescript
model: "gpt-3.5-turbo",  // For faster, cheaper responses
// or
model: "gpt-4-turbo",    // For better accuracy (current default)
```

## 6. Cost Considerations

### OpenAI API Costs:
- GPT-4 Turbo: ~$0.01-0.03 per enrichment request
- GPT-3.5 Turbo: ~$0.001-0.002 per enrichment request

### Optimization Tips:
- Use GPT-3.5 for basic enrichment
- Implement caching for repeated requests
- Add rate limiting to prevent abuse

## 7. Security Features

- **API Key Protection**: OpenAI key stored securely in Supabase secrets
- **CORS Configuration**: Only allows requests from your domain
- **Input Validation**: Validates input data before processing
- **Error Handling**: Graceful degradation if AI service is unavailable

## 8. Troubleshooting

### Common Issues:

1. **"No input data provided"**
   - Ensure at least one field (name, email, company, LinkedIn) is filled

2. **"OpenAI API error"**
   - Check your OpenAI API key in Supabase secrets
   - Verify API key has sufficient credits

3. **"Invalid AI response format"**
   - AI occasionally returns non-JSON responses
   - Function includes error handling for this scenario

4. **Function not found**
   - Ensure Edge Function is deployed: `supabase functions deploy lead-enrichment`
   - Check function logs in Supabase dashboard

### Debug Commands:
```bash
# View function logs
supabase functions logs lead-enrichment

# Test function locally
supabase functions serve lead-enrichment
```

## 9. Future Enhancements

- **Batch Enrichment**: Enrich multiple leads at once
- **Data Sources**: Integrate with LinkedIn API, Clearbit, etc.
- **Confidence Scores**: Show reliability of enriched data
- **Auto-Enrichment**: Automatically enrich leads on creation
- **Custom Prompts**: Allow users to customize enrichment prompts
- **Data Validation**: Verify enriched data against external sources

## 10. Privacy & Compliance

- **Data Processing**: Lead data is sent to OpenAI for processing
- **Retention**: OpenAI may retain data for 30 days per their policy
- **GDPR Compliance**: Ensure user consent for AI processing
- **Data Minimization**: Only send necessary fields for enrichment

---

For questions or issues, refer to the Supabase Edge Functions documentation or OpenAI API documentation.
