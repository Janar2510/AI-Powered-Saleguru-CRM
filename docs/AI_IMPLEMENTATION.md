# AI Implementation Guide

## Overview

The SaleToru CRM incorporates multiple AI-powered features to enhance productivity, automate processes, and provide intelligent insights. This document covers all AI implementations across the system.

### Latest Updates (v3.4 - Warehouse & Inventory Management)
**Warehouse & Inventory Management System** - Enterprise-grade inventory control featuring:
- Multi-warehouse support with hierarchical location structure and real-time stock tracking
- Automated stock operations with PostgreSQL functions (reserve_stock, ship_stock, adjust_stock)
- Comprehensive purchase order management with auto-numbering and receiving workflows
- Advanced inventory analytics with stock movement history and cost tracking
- Professional React hooks (useInventory) and components (WarehouseManager) integration
- Full database schema with RLS policies and optimized views for performance

### Previous Updates (v3.3 - Intelligence Hub)
**Intelligence Hub: AI Call Transcription & Analysis** - Complete voice intelligence system featuring:
- Real-time call recording and OpenAI Whisper transcription with speaker diarization
- Advanced sentiment analysis, emotion detection, and conversation insights
- Enterprise-grade settings management with privacy controls and GDPR compliance
- Professional drag-and-drop file upload system with validation and processing hooks
- Comprehensive CRM integration with automatic linking and action item generation
- Full database schema with RLS security policies and optimized analytics functions

## Advanced System Features

### 1. Warehouse & Inventory Management System

#### Overview
Enterprise-grade warehouse and inventory management system providing complete control over stock, locations, and procurement processes with real-time tracking and analytics.

#### Implementation Details
- **Location**: `src/hooks/useInventory.ts`, `src/components/warehouse/WarehouseManager.tsx`
- **Database Schema**: `supabase/migrations/0010_warehouse_inventory.sql`
- **Integration**: `src/pages/Products.tsx` (Warehouse tab)

#### Technology Stack
- **Frontend**: React with TypeScript, React Query for data management
- **Backend**: Supabase with PostgreSQL functions for atomic operations
- **Real-time**: Supabase subscriptions for live inventory updates
- **Analytics**: Custom PostgreSQL views and aggregations

#### Database Architecture

**Core Tables:**
```sql
warehouses          -- Physical warehouse locations
locations           -- Storage locations within warehouses
stock_items         -- Current stock levels per product/location
stock_moves         -- Immutable ledger of all stock transactions
purchase_orders     -- Procurement management
purchase_order_lines -- Individual items in purchase orders
so_reservations     -- Stock reserved for sales orders
shipments           -- Outbound shipments
inventory_adjustments -- Stock corrections and adjustments
```

**Key Functions:**
```sql
reserve_stock(org, product, location, qty, ref_table, ref_id)
ship_stock(org, product, location, qty, ref_table, ref_id)  
adjust_stock(org, product, location, new_qty, unit_cost, reason)
```

**Optimized Views:**
```sql
stock_available_v        -- Current stock levels with location details
product_stock_summary_v  -- Aggregated stock by product across locations
```

#### Features

**Multi-Warehouse Support:**
- Unlimited warehouses per organization
- Hierarchical location structure (Warehouse → Aisle → Rack → Shelf → Bin)
- Location-specific stock tracking and management
- Transfer operations between locations with audit trail

**Real-Time Stock Management:**
- Available, reserved, and on-hand quantity tracking
- Atomic stock operations with PostgreSQL functions
- Automatic stock reservation for sales orders
- Stock movement history with full audit trail
- Cost tracking per unit with FIFO/LIFO support

**Purchase Order Management:**
- Auto-generated PO numbers (PO-001000+)
- Multi-line purchase orders with pricing
- Status tracking (Draft → Sent → Confirmed → Received)
- Partial receiving with line-by-line quantities
- Supplier performance tracking

**Advanced Analytics:**
- Real-time inventory value calculations
- Low stock alerts with reorder suggestions
- Stock movement trends and forecasting
- Warehouse utilization metrics
- Purchase order performance analysis

#### React Hooks & Components

**useInventory Hook:**
```typescript
// Stock management
const { data: stock } = useStock(orgId);
const { data: stockMoves } = useStockMoves(productId, orgId);
const adjustStock = useAdjustStock(orgId);

// Purchase orders
const { data: purchaseOrders } = usePurchaseOrders(orgId);
const createPO = useCreatePurchaseOrder(orgId);
const receivePO = useReceivePurchaseOrder(orgId);

// Warehouses and locations
const { data: warehouses } = useWarehouses(orgId);
const { data: locations } = useLocations(warehouseId, orgId);
```

**WarehouseManager Component:**
- Tabbed interface (Overview, Stock, Movements, Purchase Orders, Locations)
- Real-time metrics dashboard with key performance indicators
- Stock adjustment modals with reason tracking
- Purchase order creation and receiving workflows
- Advanced search and filtering across all views

#### Integration Examples

**Stock Reservation for Sales Orders:**
```typescript
const reserveStock = useReserveSO();
await reserveStock.mutateAsync({
  sales_order_id: orderId,
  lines: [
    { product_id: 'prod1', qty: 10, location_id: 'loc1' },
    { product_id: 'prod2', qty: 5, location_id: 'loc2' }
  ]
});
```

**Purchase Order Receiving:**
```typescript
const receivePO = useReceivePurchaseOrder();
await receivePO.mutateAsync({
  po_id: purchaseOrderId,
  lines: [
    { line_id: 'line1', product_id: 'prod1', location_id: 'loc1', 
      qty_received: 50, unit_cost: 10.00 }
  ]
});
```

**Stock Adjustment:**
```typescript
const adjustStock = useAdjustStock();
await adjustStock.mutateAsync({
  product_id: 'prod1',
  location_id: 'loc1',
  new_qty: 100,
  unit_cost: 12.50,
  reason: 'physical_recount'
});
```

#### Security & Performance

**Row Level Security (RLS):**
- All tables protected with org_id-based RLS policies
- Multi-tenant data isolation at database level
- Secure access control for warehouse operations

**Performance Optimizations:**
- Indexed queries for fast stock lookups
- Materialized views for analytics dashboard
- Efficient pagination for large datasets
- Real-time subscriptions for live updates

#### Business Intelligence

**Key Metrics:**
- Total inventory value across all locations
- Stock turnover rates and velocity analysis
- Low stock alerts with automated reorder points
- Warehouse utilization and location efficiency
- Purchase order performance and supplier metrics

**Analytics Dashboard:**
- Real-time inventory health monitoring
- Stock movement trends and seasonal patterns
- Cost analysis and profitability tracking
- Supplier performance scorecards
- Dead stock and obsolescence reporting

#### Production Deployment

**Database Setup:**
1. Run migration: `0010_warehouse_inventory.sql`
2. Verify all tables, functions, and views created
3. Test RLS policies with different user roles
4. Validate auto-numbering sequences work

**Frontend Integration:**
1. Import WarehouseManager component in Products page
2. Configure useInventory hooks with proper org_id
3. Test all CRUD operations and real-time updates
4. Verify responsive design across devices

**Testing Checklist:**
- [ ] Stock reservation and release operations
- [ ] Purchase order creation and receiving workflow
- [ ] Stock adjustments with proper audit trail
- [ ] Multi-location transfers and tracking
- [ ] Real-time dashboard updates and alerts
- [ ] Performance with large datasets (1000+ products)

## AI-Powered Features

### 2. Lead Enrichment System

#### Overview
Automatically enriches lead data using OpenAI to fill in missing information from partial contact details.

#### Implementation Details
- **Location**: `supabase/functions/lead-enrichment/index.ts`
- **Frontend Hook**: `src/hooks/useLeadEnrichment.ts`
- **Integration**: `src/pages/Leads.tsx`

#### Technology Stack
- **Backend**: Supabase Edge Functions (Deno runtime)
- **AI Model**: OpenAI GPT-4-turbo
- **Authentication**: Supabase service role authentication
- **API**: OpenAI Chat Completions API

#### Data Flow
```
User Input (partial lead data) → Frontend Hook → Supabase Edge Function → OpenAI API → Enriched Data → Frontend Update
```

#### Input Data
```typescript
interface LeadInfo {
  name?: string;
  email?: string;
  company?: string;
  linkedinUrl?: string;
}
```

#### Output Data
```typescript
interface EnrichedData {
  fullName: string;
  jobTitle: string;
  linkedinUrl: string;
  companyName: string;
  location: string;
  workEmail: string;
  phoneNumber: string;
}
```

#### Edge Function Setup
```bash
# Deploy the function
supabase functions deploy lead-enrichment

# Set required environment variable
supabase secrets set OPENAI_API_KEY=your_openai_api_key_here
```

#### Usage Example
```typescript
const { enrichLead, loading, error } = useLeadEnrichment();

const handleEnrich = async () => {
  const enrichedData = await enrichLead({
    name: "John Doe",
    company: "Tech Corp"
  });
  
  if (enrichedData) {
    // Update form fields with enriched data
    setFormData(enrichedData);
  }
};
```

### 2. Smart Calendar AI

#### Overview
Intelligent scheduling system with conflict detection, optimal time suggestions, and productivity insights.

#### Implementation Details
- **Location**: `src/pages/Calendar.tsx`
- **Functions**: Multiple AI-powered scheduling functions
- **Integration**: Real-time calendar analysis

#### AI Features

##### Conflict Detection
```typescript
const generateAISuggestions = () => {
  // Analyzes calendar events for overlapping times
  // Warns users about potential scheduling conflicts
  // Suggests alternative meeting times
};
```

##### Free Time Analysis
```typescript
const findFreeTime = (duration: number = 60, date?: Date) => {
  // Intelligently finds available time slots
  // Considers working hours (9 AM - 6 PM)
  // Accounts for existing meetings and buffers
  // Returns optimal scheduling suggestions
};
```

##### Productivity Insights
- **Meeting Load Analysis**: Calculates daily/weekly meeting density
- **Peak Hours Detection**: Identifies most productive time periods
- **Focus Time Recommendations**: Suggests uninterrupted work blocks
- **Overbooking Prevention**: Warns before scheduling conflicts

#### AI Suggestion Types
```typescript
interface AISuggestion {
  id: string;
  type: 'warning' | 'suggestion' | 'productivity';
  title: string;
  description: string;
  action: string;
  priority: 'high' | 'medium' | 'low';
}
```

##### Example Suggestions
1. **Conflict Warning**: "Schedule Conflict Detected - You have 2 overlapping events today"
2. **Optimal Time**: "10:00 - 11:00 is free and ideal for meetings"
3. **Focus Time**: "Block 2 hours for deep work during your productive hours"

### 3. Team Status Intelligence

#### Overview
AI-powered team availability detection and status management.

#### Implementation Details
- **Location**: `src/pages/Calendar.tsx`
- **Features**: Real-time status detection and smart scheduling

#### Status Detection Algorithm
```typescript
const detectUserStatus = (events: CalendarEvent[], currentTime: Date) => {
  // Automatically detects user status based on calendar events
  // Updates status indicators in real-time
  // Provides context-aware availability information
};
```

#### Status Categories
- **🟢 Online**: Available for collaboration
- **🔴 Busy**: In focus mode, avoid interrupting
- **📹 In Meeting**: Currently in video conference
- **📞 On Call**: Active phone conversation
- **🟡 Away**: Temporarily unavailable
- **⚫ Offline**: Not available

#### Smart Features
- **Auto-status Updates**: Changes status based on calendar events
- **Context Awareness**: Understands meeting types and urgency
- **Team Visibility**: Shows real-time availability across team
- **Permission Controls**: Respects privacy and sharing preferences

### 4. Intelligence Hub - AI Call Transcription & Analysis

#### Overview
Advanced voice intelligence system that automatically transcribes, analyzes, and extracts actionable insights from sales calls and meetings.

#### Implementation Details
- **Location**: `src/pages/Intelligence.tsx`
- **Services**: `src/services/aiTranscriptionService.ts`, `src/services/callIntegrationService.ts`
- **Hook**: `src/hooks/useAITranscription.ts`
- **Database**: New call intelligence tables with RLS policies

#### Technology Stack
- **Frontend**: React with TypeScript, MediaRecorder API for recording
- **AI Services**: OpenAI Whisper for transcription, GPT-4 for analysis
- **Database**: PostgreSQL with specialized call intelligence schema
- **Real-time**: WebRTC for audio capture, real-time transcription processing

#### Features

##### Real-Time Call Recording & Transcription
```typescript
interface TranscriptionResult {
  transcript: string;
  confidence: number;
  language: string;
  speakers: {
    id: string;
    name?: string;
    segments: {
      start: number;
      end: number;
      text: string;
      confidence: number;
    }[];
  }[];
}
```

##### AI-Powered Call Analysis
```typescript
interface AIAnalysisResult {
  summary: string;
  sentiment: {
    overall: 'positive' | 'neutral' | 'negative';
    confidence: number;
    emotions: string[];
    score: number;
  };
  insights: {
    customerNeeds: string[];
    objections: string[];
    opportunities: string[];
    concerns: string[];
    keyQuotes: string[];
    competitorsMentioned: string[];
    dealIndicators: string[];
  };
  actionItems: ActionItem[];
  nextSteps: string[];
  dealProbability?: number;
  urgency: 'low' | 'medium' | 'high';
}
```

##### CRM Integration Features
- **Auto-linking**: Calls automatically linked to contacts, deals, organizations
- **Deal Updates**: Real-time deal probability updates based on call sentiment
- **Action Items**: AI-extracted tasks with priority and assignment
- **Team Notifications**: Alerts for high-priority or negative sentiment calls
- **Search & Analytics**: Full-text search across transcripts with analytics

#### Database Schema
```sql
-- Core tables for call intelligence
call_transcripts         -- Main call records with transcription and analysis
call_participants        -- Speaker identification and speaking time analytics
call_action_items        -- AI-extracted action items with tracking
call_keywords           -- Keywords and topics for analytics
call_sentiment_timeline -- Detailed sentiment analysis over time
```

#### Business Intelligence
- **Performance Metrics**: Call duration, sentiment scores, conversion rates
- **Trend Analysis**: Sentiment trends, keyword frequency, competitor mentions
- **Team Analytics**: Speaking time analysis, action item completion rates
- **Predictive Insights**: Deal probability estimation, urgency assessment

#### Enterprise Configuration System
```typescript
interface IntelligenceSettings {
  // AI Configuration
  transcriptionLanguage: string;
  analysisModel: 'gpt-4' | 'gpt-3.5-turbo' | 'claude';
  confidenceThreshold: number;
  realTimeProcessing: boolean;
  speakerIdentification: boolean;
  sentimentAnalysis: boolean;
  
  // Privacy & Security
  dataRetention: number;
  encryptionLevel: 'aes256' | 'aes128';
  gdprCompliance: boolean;
  
  // CRM Integration
  autoLinkContacts: boolean;
  autoCreateActionItems: boolean;
  updateDealProbabilities: boolean;
  sendTeamNotifications: boolean;
  
  // Performance
  audioQuality: 'high' | 'medium' | 'low';
  processingPriority: 'realtime' | 'fast' | 'standard' | 'batch';
}
```

#### Settings Management Features
- **Persistent Configuration**: localStorage with validation and export/import
- **Real-time Updates**: Live settings application without page refresh
- **Privacy Controls**: GDPR compliance, data retention, encryption settings
- **Performance Tuning**: Audio quality, processing priority, cache duration
- **Integration Control**: CRM auto-linking, automation triggers, notifications
- **User Preferences**: Language, model selection, confidence thresholds

#### File Upload System
- **Drag & Drop Interface**: Visual feedback with hover states and animations
- **File Validation**: Type checking (audio/video), size limits (100MB)
- **Processing Pipeline**: Integration hooks for AI transcription services
- **Error Handling**: User-friendly validation messages and fallbacks
- **Progress Tracking**: Real-time upload status and processing indicators

#### Service Architecture
```typescript
// Core Services
aiTranscriptionService     -- OpenAI Whisper integration and mock transcription
callIntegrationService     -- CRM integration and data persistence
intelligenceSettingsService -- Configuration management and persistence

// React Hooks
useAITranscription         -- Real-time recording and processing state management

// Integration Examples
openaiIntegration.ts       -- Production-ready OpenAI API implementations
```

#### Production Integration Guide
- **OpenAI API Keys**: Environment variable configuration for secure API access
- **Real-time Processing**: WebSocket streaming for live transcription updates
- **Speaker Diarization**: Integration with specialized services (AssemblyAI, etc.)
- **Rate Limiting**: API usage monitoring and cost management
- **Data Privacy**: Encryption in transit/rest, compliance with GDPR/CCPA
- **Performance Optimization**: Caching, chunking, and parallel processing

### 5. Guru (AI Hub) - Conversational Intelligence

#### Overview
Central AI-powered chat interface providing natural language access to all CRM data and insights.

#### Implementation Details
- **Location**: `src/pages/Guru.tsx`
- **Features**: Chat interface, contextual AI responses, business intelligence
- **Integration**: All existing AI services and CRM data

#### Technology Stack
- **Frontend**: React with TypeScript
- **AI Service**: OpenAI GPT-4 for natural language processing
- **UI Components**: Brand-consistent chat interface
- **Data Integration**: Real-time CRM data access

#### Features

##### Conversational CRM Interface
```typescript
interface GuruMessage {
  id: string;
  sender: 'user' | 'guru';
  content: string;
  timestamp: Date;
  context?: {
    query_type: string;
    data_source: string;
    confidence: number;
  };
}
```

##### AI Query Processing
- **Lead Analysis**: "What are my top leads this week?"
- **Deal Insights**: "Show me deals about to close"
- **Invoice Management**: "Which invoices are overdue?"
- **Team Productivity**: "How is my team performing?"
- **Calendar Intelligence**: "When is my next available time slot?"

##### Smart Response System
```typescript
const processAIQuery = async (query: string) => {
  // Natural language processing
  // Context determination (leads, deals, invoices, etc.)
  // Data retrieval from relevant CRM modules
  // AI-powered response generation
  // Formatted response with actionable insights
};
```

#### Context-Aware Responses
The system analyzes user queries and provides responses based on:
- **Lead Data**: Scoring, conversion rates, top prospects
- **Deal Pipeline**: Stage analysis, forecasting, risk assessment
- **Invoice Status**: Payment tracking, overdue analysis, cash flow
- **Team Performance**: Productivity metrics, workload analysis
- **Calendar Intelligence**: Scheduling optimization, availability analysis

### 5. AI-Powered Scheduling Optimization

#### Overview
Machine learning algorithms for optimal meeting scheduling and resource allocation.

#### Implementation Features

##### Optimal Meeting Time Suggestions
```typescript
const suggestOptimalTimes = (participants: TeamMember[], duration: number) => {
  // Analyzes all participants' calendars
  // Finds mutual availability windows
  // Considers time zones and preferences
  // Suggests best meeting times with reasoning
};
```

##### Productivity Analysis
```typescript
const analyzeMeetingLoad = (events: CalendarEvent[]) => {
  // Calculates meeting density and patterns
  // Identifies over-scheduled periods
  // Suggests schedule optimization
  // Provides productivity metrics
};
```

##### Context-Aware Scheduling
- **Meeting Type Recognition**: Differentiates between calls, meetings, focus time
- **Urgency Assessment**: Prioritizes important meetings
- **Buffer Time Management**: Automatically accounts for travel/prep time
- **Resource Optimization**: Maximizes team productivity

## AI Configuration

### Required Environment Variables

#### Production Environment
```bash
# OpenAI API Configuration
OPENAI_API_KEY=sk-your-openai-api-key-here

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

#### Development Environment
```bash
# Add to .env.local
VITE_OPENAI_API_KEY=sk-your-development-key
VITE_AI_FEATURES_ENABLED=true
```

### Supabase Secrets Management
```bash
# Set OpenAI API key securely
supabase secrets set OPENAI_API_KEY=your_actual_api_key

# List all secrets
supabase secrets list

# Remove a secret if needed
supabase secrets unset OPENAI_API_KEY
```

## API Usage and Costs

### OpenAI API Usage

#### Lead Enrichment
- **Model**: GPT-4-turbo
- **Average Tokens**: ~500 tokens per enrichment
- **Estimated Cost**: $0.01 per lead enrichment
- **Rate Limits**: 500 requests per minute

#### Smart Calendar Features
- **Model**: GPT-3.5-turbo (for suggestions)
- **Average Tokens**: ~200 tokens per analysis
- **Estimated Cost**: $0.002 per analysis
- **Frequency**: On-demand user requests

### Cost Optimization Strategies

1. **Caching**: Store AI responses for similar queries
2. **Batching**: Process multiple requests together
3. **Smart Triggers**: Only call AI when necessary
4. **Fallback Logic**: Provide basic functionality without AI

## Error Handling

### Edge Function Error Handling
```typescript
try {
  const response = await openaiApi.chat.completions.create({
    model: "gpt-4-turbo",
    messages: [...],
    temperature: 0.7,
    max_tokens: 1000
  });
  
  return parseAIResponse(response);
} catch (error) {
  console.error('AI API Error:', error);
  return generateFallbackResponse();
}
```

### Frontend Error Handling
```typescript
const { enrichLead, loading, error } = useLeadEnrichment();

if (error) {
  showToast({
    title: 'AI Enrichment Failed',
    type: 'error',
    message: 'Using available data. AI features temporarily unavailable.'
  });
}
```

### Graceful Degradation
- **AI Unavailable**: System continues with manual data entry
- **Rate Limits**: Queue requests and retry with exponential backoff
- **Network Issues**: Cache previous AI responses and use locally
- **API Errors**: Provide meaningful user feedback and alternatives

## Performance Monitoring

### Key Metrics to Track

1. **AI Response Times**
   - Lead enrichment latency
   - Calendar analysis speed
   - User experience impact

2. **AI Accuracy**
   - Lead enrichment quality scores
   - Calendar suggestion acceptance rates
   - User satisfaction feedback

3. **API Usage**
   - Daily/monthly token consumption
   - Cost per user/organization
   - Rate limit adherence

4. **Error Rates**
   - AI service availability
   - Function timeout rates
   - Fallback activation frequency

### Monitoring Implementation
```typescript
// Track AI performance metrics
const trackAIMetrics = (feature: string, duration: number, success: boolean) => {
  analytics.track('ai_feature_usage', {
    feature,
    duration,
    success,
    timestamp: new Date().toISOString()
  });
};
```

## Security Considerations

### API Key Security
- **Environment Variables**: Never expose OpenAI keys in frontend
- **Supabase Secrets**: Use secure secret management
- **Rotation Policy**: Regularly rotate API keys
- **Access Controls**: Limit key permissions and scope

### Data Privacy
- **Data Minimization**: Only send necessary data to AI services
- **User Consent**: Inform users about AI processing
- **Data Retention**: Don't store sensitive data in AI logs
- **Compliance**: Ensure GDPR/CCPA compliance for AI features

### Request Validation
```typescript
// Validate and sanitize AI requests
const validateAIRequest = (data: any) => {
  // Remove sensitive information
  // Validate input format
  // Apply rate limiting
  // Log for audit purposes
};
```

## Future AI Enhancements

### Phase 5: Advanced Intelligence Features

1. **Enhanced Intelligence Hub (v2)**
   - Real-time live transcription during calls
   - Advanced speaker recognition with voice biometrics
   - Multi-language support for global teams
   - Video call analysis with visual cues and body language insights
   - Direct integration with Zoom, Teams, Google Meet

2. **Advanced Call Analytics**
   - Conversation flow analysis and optimization
   - Sales technique effectiveness measurement
   - Emotional intelligence scoring
   - Competitive positioning insights from call content

### Planned Features

3. **Smart Lead Scoring**
   - ML model for lead quality assessment
   - Predictive analytics for conversion probability
   - Automated lead prioritization

4. **Intelligent Deal Forecasting**
   - AI-powered sales predictions
   - Deal stage progression analysis
   - Revenue forecasting models

3. **Advanced Calendar Intelligence**
   - Meeting outcome prediction
   - Automatic meeting notes generation
   - Smart meeting preparation suggestions

4. **Enhanced Conversational AI (Guru v2)**
   - Voice-activated commands and responses
   - Multi-language support for global teams
   - Proactive insights and recommendations
   - Integration with external data sources

### Implementation Roadmap

#### Phase 1: Enhanced AI Integration (Q1)
- Improve lead enrichment accuracy
- Add more calendar intelligence features
- Implement AI performance monitoring

#### Phase 2: Predictive Analytics (Q2)
- Lead scoring machine learning model
- Deal forecasting algorithms
- Customer behavior analysis

#### Phase 3: Advanced AI Features (Q3)
- Conversational AI interface
- Automated workflow suggestions
- Real-time decision support

#### Phase 4: AI-First Experience (Q4)
- Proactive AI recommendations
- Automated task generation
- Intelligent data discovery

## Best Practices

### Development Guidelines

1. **AI-First Design**: Build features with AI capabilities from the start
2. **Fallback Strategies**: Always provide non-AI alternatives
3. **User Control**: Allow users to disable AI features
4. **Transparency**: Clearly indicate when AI is being used
5. **Testing**: Thoroughly test AI features with various scenarios

### Code Organization
```
src/
├── ai/
│   ├── hooks/
│   │   ├── useLeadEnrichment.ts
│   │   ├── useCalendarAI.ts
│   │   └── useAIAnalytics.ts
│   ├── services/
│   │   ├── openai.ts
│   │   └── aiUtils.ts
│   └── types/
│       └── aiTypes.ts
```

### Performance Optimization
- **Lazy Loading**: Load AI features only when needed
- **Response Caching**: Cache AI responses for similar queries
- **Progressive Enhancement**: Layer AI features on top of core functionality
- **Resource Management**: Monitor and optimize AI resource usage

## Troubleshooting

### Common Issues

#### 1. Lead Enrichment Not Working
- Check OpenAI API key configuration
- Verify Supabase Edge Function deployment
- Test function directly with curl/Postman
- Check CORS settings for frontend domain

#### 2. Calendar AI Suggestions Empty
- Verify calendar data is loading properly
- Check date/time calculations
- Ensure event data format is correct
- Test with sample data

#### 3. High AI API Costs
- Review request frequency and patterns
- Implement response caching
- Optimize prompt engineering
- Consider rate limiting

### Debug Commands
```bash
# Test Edge Function locally
supabase functions serve lead-enrichment

# Check function logs
supabase functions logs lead-enrichment

# Test AI endpoint
curl -X POST 'http://localhost:54321/functions/v1/lead-enrichment' \
  -H 'Content-Type: application/json' \
  -d '{"name":"John Doe","company":"Test Corp"}'
```

## Conclusion

The AI implementation in SaleToru CRM provides intelligent automation and insights while maintaining user control and system reliability. The architecture supports future enhancements and scales with usage growth, ensuring a robust foundation for advanced AI features.

For support or questions about AI features, refer to the development team or create an issue in the project repository.
