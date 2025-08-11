# Deployment Guide for Saleguru CRM

## 1. Prerequisites
- Node.js (v18+ recommended)
- Supabase project (with all tables and functions migrated)
- OpenAI and enrichment API keys

## 2. Environment Setup
- Copy `.env.example` to `.env` and fill in all required variables (Supabase URL, anon key, API keys, etc.).
- Ensure Supabase environment variables are set in the Supabase dashboard.

## 3. Database Migration
- Run all SQL migrations in `supabase/migrations/` using the Supabase SQL editor or CLI.
- Confirm all tables, indexes, and functions are present (see `DEPLOYMENT_CHECKLIST.md`).

## 4. Frontend Deployment
- Build the frontend:
  ```sh
  npm install
  npm run build
  ```
- Deploy the `dist/` folder to your hosting provider (Vercel, Netlify, etc.).

## 5. Supabase Edge Functions
- Deploy all functions in `supabase/functions/`:
  ```sh
  supabase functions deploy <function-name>
  ```
- Test endpoints using the Supabase dashboard or Postman.

## 6. Post-Deployment Checklist
- Test all core features (CRUD, AI, onboarding, etc.).
- Check for errors in browser console and Supabase logs.
- Confirm environment variables are correct in production.
- Review `DEPLOYMENT_CHECKLIST.md` for any remaining tasks.

## 7. Best Practices
- Use HTTPS for all endpoints.
- Never expose API keys in frontend code.
- Enable RLS and security policies before production (see checklist).
- Monitor Supabase and OpenAI usage/quota.

## 8. Troubleshooting & Rollback
- If a migration or deployment fails, restore from the latest backup.
- Use Supabase dashboard to roll back schema changes if needed.
- For frontend, redeploy the previous working build.

## Troubleshooting

### CreateDealModal .map Runtime Error
If you see a runtime error like `Cannot read properties of undefined (reading 'map')` in CreateDealModal, ensure that the `stages`, `companies`, and `contacts` props are always arrays. This can be done by defaulting to empty arrays when data is not yet loaded or by using `(array || []).map(...)` in the component.

### Deal Detail View Card Functions
All DealDetailsModal functions (edit, save, delete, update, etc.) are implemented and connected. If you encounter missing functionality, check that the modal is receiving the correct props and handlers from the parent component.

## New Features to Test Before Deployment

- [ ] Feature gating with useFeatureLock (test for all plans and dev mode)
- [ ] DebugTools page (test user/session/database/settings tabs, copy/export)
- [ ] Password reset flow (ForgotPassword and ResetPassword pages)
- [ ] admin_email field migration and enforcement in users table
- [ ] Pulse Sequence Builder page (AI-powered email automation, drag-and-drop, brand-consistent UI)
- [ ] Brand consistency: All new/updated pages use brand tokens for cards, buttons, badges, spacing, and layout. All icons and typography follow the brand guide. All margins and paddings match the dashboard.

---

> For further help, see the Supabase and Vercel/Netlify docs, or contact the project maintainer. 