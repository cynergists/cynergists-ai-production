# Apex Migration Guide (Supabase → MySQL)

This document tells the new system what to build to run Apex without Supabase. The frontend should remain the same, but all backend and data services move to a MySQL-based stack.

## Goal

Replace Supabase (Auth + Postgres + Edge Functions) with:
- MySQL for all persistence
- A custom API service (REST or GraphQL) to replace Supabase client calls and Edge Functions
- A new auth/session system compatible with the current frontend flow

## Current Apex Overview (What Exists Today)

- Frontend: React + Vite + TypeScript + React Query
- Data access: `supabase-js` client from the browser
- Backend logic: Supabase Edge Functions (Deno)
- Auth: Supabase Auth (session JWT stored in localStorage)
- External APIs: Unipile (LinkedIn), Apify, OpenAI, ElevenLabs, Resend

## What Must Be Rebuilt

### 1) Authentication + Sessions

The frontend expects:
- A logged-in user with `user.id` available in `useAuth()`
- Session persistence across reloads
- JWT-style auth that can be sent with API calls

Minimum auth features to implement:
- Email/password sign up + sign in
- Social login callback support (Google OAuth used as secondary)
- Session refresh / token rotation
- Admin roles (see `user_roles` table)

### 2) Database (MySQL)

Create these core tables and relationships. These map to the existing Supabase schema used in the frontend and edge functions.

Core tables (from `docs/PROJECT_OVERVIEW.md`):
- `users` (profile + LinkedIn connection state)
- `user_roles` (admin/user)
- `user_preferences`
- `external_accounts` (LinkedIn account links)
- `campaigns`
- `campaign_prospects`
- `prospects`
- `pending_actions`
- `pending_auth_sessions`
- `activity_log`
- `conversation_messages`
- `voice_sessions`
- `voice_session_events`

Key fields to preserve:
- `users`: `id`, `email`, `full_name`, `unipile_account_id`, `unipile_api_key`, `unipile_domain`, `autopilot_enabled`, `auto_reply_enabled`, `meeting_link`, `onboarding_completed`, `apex_context`, `apex_context_updated_at`, timestamps
- `campaigns`: `user_id`, `name`, `campaign_type`, `job_titles[]`, `locations[]`, `keywords[]`, `follow_up_*`, `booking_method`, `calendar_link`, `phone_number`, counters + timestamps
- `conversation_messages`: `user_id`, `role`, `content`, `session_type`, `voice_session_id`, `metadata`, timestamps
- `pending_actions`: approval queue for user-confirmed actions

Notes:
- Postgres arrays in Supabase (`job_titles`, `locations`, `keywords`) need MySQL equivalents (JSON columns are acceptable).
- `metadata` is JSON in several tables.
- All user-scoped tables are filtered by `user_id` in the frontend.

### 3) API Surface (Replace Supabase Client)

The frontend currently calls `supabase.from('<table>')` for CRUD. The new system must expose equivalent endpoints. At minimum:

CRUD endpoints needed by hooks:
- `/users` (get current user profile, update)
- `/user_preferences` (get/update by user)
- `/campaigns` (list, create, update, delete)
- `/conversation_messages` (list, insert, delete)
- `/activity_log` (list)
- `/external_accounts` (list/update)
- `/pending_actions` (list/approve/deny)
- `/voice_sessions` + `/voice_session_events` (insert/list)

### 4) Edge Functions → API Endpoints

Re-implement these Supabase functions as server endpoints or background jobs:

Auth / LinkedIn
- `linkedin-custom-auth`
- `linkedin-solve-checkpoint`
- `check-linkedin-auth`
- `linkedin-finalize-auth`
- `login-with-linkedin`
- `connect-linkedin`
- `disconnect-linkedin`
- `linkedin-auth-callback`
- `linkedin-webhook`
- `linkedin-connection-callback`
- `exchange-auth-token`

Messaging
- `get-all-chats`
- `get-chat-messages`
- `get-unread-chats`
- `send-chat-message`
- `reply-to-unread`
- `get-all-connections`

Campaigns
- `run-campaign`
- `find-and-connect`
- `message-connections`
- `process-follow-ups`

AI / Voice
- `onboarding-chat`
- `train-persona`
- `generate-user-context`
- `elevenlabs-conversation-token`
- `elevenlabs-list-agents`

Admin / Maintenance
- `approve-action`
- `deny-action`
- `cleanup-pending-actions`
- `check-linkedin-health`
- `linkedin-account-status`
- `linkedin-check-account-status`
- `delete-all-unipile-accounts`

### 5) Background Jobs / Schedules

Some functions are meant to run on a schedule:
- `process-follow-ups`
- `cleanup-pending-actions`
- campaign execution (`run-campaign`, `message-connections`, `find-and-connect`)

Use cron or a queue worker (e.g., BullMQ, Sidekiq, Celery) and store job state in MySQL.

### 6) Webhooks + External Integrations

Required external integrations:
- Unipile: account status callbacks + messaging endpoints
- Apify: lead generation
- OpenAI: AI responses + summarization
- ElevenLabs: voice tokens and agent list
- Resend: email sending

Make sure webhook endpoints are public and authenticated (HMAC or shared secret).

## Frontend Changes Required

1) Replace Supabase client:
- `src/integrations/supabase/client.ts` should be removed or replaced.
- Update hooks in `src/hooks/*` to call the new API.

2) Replace Supabase auth:
- `src/lib/auth.tsx` should use new auth endpoints.
- Persist session tokens in localStorage (same behavior).

3) Update environment variables:
- Replace `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` with:
  - `VITE_API_BASE_URL`
  - `VITE_AUTH_PUBLIC_KEY` (if needed)

## Data Migration Steps

1) Export Supabase/Postgres data (CSV or SQL dump).
2) Create MySQL schema with equivalent tables and constraints.
3) Transform array fields to JSON columns.
4) Import users first, then dependent tables.
5) Verify row counts and foreign keys.

## Acceptance Checklist for the New System

- User can sign in and remains signed in after reload
- Campaigns page loads, creates, updates, deletes
- Chat history loads and persists (`conversation_messages`)
- Voice sessions store and read events
- LinkedIn connection flow works (custom auth + checkpoints)
- Unipile callbacks update user/account status
- Campaign automation functions execute
- Admin approval queue works
- All external API keys are configurable via env vars

## References in This Repo

- High-level architecture: `docs/PROJECT_OVERVIEW.md`
- Supabase functions: `supabase/functions/*`
- Hooks using Supabase client: `src/hooks/*`
- Supabase client config: `src/integrations/supabase/client.ts`
