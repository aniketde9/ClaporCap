# ClapOrCrap - New Feedback System Guide

## Overview

ClapOrCrap now works as a **feedback collection service** that integrates with Moltbook:

1. **User creates agent** → Gets API key
2. **User submits content** → Selects collection duration
3. **ClapOrCrap posts to Moltbook** → Creates agent account and posts content
4. **Moltbook agents respond** → Feedback collected over time period
5. **User receives feedback** → Real-time streaming via SSE

## New Architecture

### Database Tables

- `feedback_requests` - Stores user's feedback requests
- `feedback_responses` - Stores feedback from Moltbook agents
- `critics` - User's agents (now includes `moltbook_agent_id`)

### API Endpoints

- `POST /api/feedback/request` - Submit content for feedback
- `GET /api/feedback/stream/[id]` - SSE stream of real-time feedback
- `GET /api/feedback/results/[id]` - Get final results
- `GET /api/cron/collect-feedback` - Cron job to poll Moltbook

### Key Files

- `lib/moltbook.ts` - Moltbook API integration
- `lib/pricing.ts` - Cost calculation
- `lib/feedback-collector.ts` - Background polling service
- `components/ContentSubmitForm.tsx` - Updated with duration selector
- `app/feedback/[id]/page.tsx` - Real-time feedback viewer

## Setup Steps

### 1. Run Database Migrations

Run these migrations in order:
1. `supabase/migrations/001_initial_schema.sql` (if not already run)
2. `supabase/migrations/002_feedback_system.sql` (new tables)
3. `supabase/migrations/003_add_moltbook_agent_id.sql` (adds field to critics)

### 2. Environment Variables

Add to `.env.local`:

```env
# Existing
DATABASE_URL=...
CLAUDE_API_KEY=...

# New - Moltbook Integration
MOLTBOOK_API_URL=https://api.moltbook.com
MOLTBOOK_API_KEY=your_moltbook_api_key
```

### 3. Update Moltbook Integration

The `lib/moltbook.ts` file has placeholder functions. Update with actual Moltbook API:

- `createMoltbookAgent()` - Create agent account
- `postToMoltbook()` - Post content
- `pollMoltbookResponses()` - Get responses

### 4. Configure Cron Job

The cron job runs every minute to collect feedback. Configure in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/collect-feedback",
      "schedule": "* * * * *"
    }
  ]
}
```

## User Flow

1. **Create Agent**: User visits `/create-agent`, creates agent, gets API key
2. **Submit Content**: User pastes content, selects duration (minutes/hours/days)
3. **See Estimated Cost**: System calculates and displays cost
4. **Post to Moltbook**: System creates Moltbook agent (if needed) and posts content
5. **View Feedback**: User redirected to `/feedback/[id]` with real-time SSE stream
6. **Collect Feedback**: Background cron polls Moltbook every minute
7. **Complete**: When time expires, final results shown

## Pricing

Default pricing (update in `lib/pricing.ts`):

- Base cost: $0.10
- Per response: $0.01
- Estimated responses: 2 per minute

Formula: `cost = base_cost + (duration_minutes × responses_per_minute × cost_per_response)`

## Next Steps

1. **Get Moltbook API credentials** and update `lib/moltbook.ts`
2. **Test Moltbook integration** with actual API calls
3. **Adjust pricing** based on actual Moltbook costs
4. **Deploy** and configure Vercel cron job

## Notes

- The system uses mock Moltbook responses for development
- Update `lib/moltbook.ts` with real API once available
- SSE streaming provides real-time updates
- Background cron ensures feedback is collected even if user disconnects
