# 🔄 Complete Supabase to MySQL Refactoring Guide

## ✅ Progress So Far

### Phase 1: Backend API (COMPLETE)
- ✅ Created `PartnerDataController` with all partner endpoints
- ✅ Added API routes for:
  - GET `/api/partner/commissions`
  - GET `/api/partner/payouts`
  - GET `/api/partner/referrals`
  - POST `/api/partner/referrals`
  - GET `/api/partner/deals`
  - GET `/api/partner/marketing-assets`
  - GET `/api/partner/scheduled-reports`

### Phase 2: Frontend Updates (IN PROGRESS)
**38 files need updating**

---

## 🎯 Step-by-Step Refactoring Instructions

### For Each File:

1. **Remove Supabase import:**
   ```typescript
   // REMOVE:
   import { supabase } from '@/integrations/supabase/client';
   ```

2. **Add API client import:**
   ```typescript
   // ADD:
   import { apiClient } from '@/lib/api-client';
   ```

3. **Replace Supabase queries:**
   
   **Before (Supabase):**
   ```typescript
   const { data, error } = await supabase
       .from('partner_commissions')
       .select('*')
       .eq('partner_id', partnerId);
   
   if (error) throw error;
   ```

   **After (Laravel API):**
   ```typescript
   try {
       const data = await apiClient.get('/partner/commissions');
       // data is already the result, no need to check error
   } catch (error) {
       console.error('Error:', error);
       toast({ 
           title: 'Error', 
           description: error.message, 
           variant: 'destructive' 
       });
   }
   ```

---

## 📝 File-by-File Refactoring Checklist

### Partner Portal (PRIORITY 1 - 7 files)

#### ✅ 1. `pages/partner/Commissions.tsx`
**What to change:**
```typescript
// OLD:
const { data, error } = await supabase
    .from('partner_commissions')
    .select('*, customer:clients!partner_commissions_customer_id_fkey(name, company)')
    .eq('partner_id', partner.id)
    .order('created_at', { ascending: false });

// NEW:
const data = await apiClient.get('/partner/commissions');
```

#### ✅ 2. `pages/partner/Payouts.tsx`
**What to change:**
```typescript
// OLD:
const { data, error } = await supabase
    .from('partner_payouts')
    .select('*')
    .eq('partner_id', partner.id);

// NEW:
const data = await apiClient.get('/partner/payouts');
```

#### ✅ 3. `pages/partner/Referrals.tsx`
**What to change:**
```typescript
// OLD (GET):
const { data, error } = await supabase
    .from('referrals')
    .select('*')
    .eq('partner_id', partner.id);

// NEW (GET):
const data = await apiClient.get('/partner/referrals');

// OLD (POST):
const { error } = await supabase.from('referrals').insert({
    partner_id: partner.id,
    email: form.email,
    // ...
});

// NEW (POST):
await apiClient.post('/partner/referrals', {
    email: form.email,
    company_name: form.companyName,
    // ...
});
```

#### ✅ 4. `pages/partner/Deals.tsx`
**What to change:**
```typescript
// OLD:
const { data, error } = await supabase
    .from('partner_deals')
    .select('*')
    .eq('partner_id', partner.id);

// NEW:
const data = await apiClient.get('/partner/deals');
```

#### ✅ 5. `pages/partner/Marketing.tsx`
**What to change:**
```typescript
// OLD:
const { data, error } = await supabase
    .from('partner_assets')
    .select('*')
    .eq('partner_id', partner.id);

// NEW:
const data = await apiClient.get('/partner/marketing-assets');
```

#### ✅ 6. `pages/partner/Reports.tsx`
**What to change:**
```typescript
// OLD:
const { data: reports } = await supabase
    .from('partner_scheduled_reports')
    .select('*')
    .eq('partner_id', partner.id);

const { data: runs } = await supabase
    .from('report_runs')
    .select('*');

// NEW:
const reports = await apiClient.get('/partner/scheduled-reports');
// Note: May need new endpoint for report_runs
```

#### ✅ 7. `pages/partner/Marketplace.tsx`
**What to change:**
```typescript
// OLD:
const { data, error } = await supabase
    .from('portal_available_agents')
    .select('*')
    .eq('is_active', true);

// NEW:
const data = await apiClient.get('/public/agents');
// This endpoint already exists!
```

---

### Authentication (PRIORITY 2 - 3 files)

#### ✅ 8. `pages/auth/ForgotPassword.tsx`
**What to change:**
```typescript
// OLD:
const { error } = await supabase.auth.resetPasswordForEmail(email);

// NEW:
await apiClient.post('/password/email', { email });
// Uses Laravel's built-in password reset
```

#### ✅ 9. `pages/auth/ResetPassword.tsx`
**What to change:**
```typescript
// OLD:
const { error } = await supabase.auth.updateUser({
    password: newPassword
});

// NEW:
await apiClient.post('/password/reset', {
    token: tokenFromUrl,
    email: emailFromUrl,
    password: newPassword,
    password_confirmation: confirmPassword
});
```

#### ✅ 10. `pages/auth/PartnerApplication.tsx`
**What to change:**
```typescript
// OLD:
const { error } = await supabase
    .from('partner_applications')
    .insert(applicationData);

// NEW:
await apiClient.post('/partner/apply', applicationData);
// Note: Need to create this endpoint
```

---

### Admin/Debug Tools (PRIORITY 3 - 6 files)

These can return empty data for now using the no-op Supabase client, or you can create admin API endpoints:

#### ✅ 11. `hooks/useDebugData.ts`
**What to change:**
- Comment out Supabase queries
- Return empty arrays
- Or create `/api/admin/debug` endpoint

#### ✅ 12-16. Analytics Hooks
- `hooks/useClarityAnalytics.ts`
- `hooks/useSquareAnalytics.ts`
- `hooks/usePlatformAnalytics.ts`
- `hooks/useStaffList.ts`
- `hooks/useCategoriesQueries.ts`

**What to change:**
- Create admin API endpoints if needed
- Or disable for now (return empty data)

---

### Public Pages (PRIORITY 4 - 4 files)

#### ✅ 17. `pages/Blog.tsx`
**What to change:**
```typescript
// OLD:
const { data } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('published', true);

// NEW:
const data = await apiClient.get('/blog/posts');
// Note: Need to create blog API endpoint
```

#### ✅ 18-20. Other Public Pages
- `pages/BlogPost.tsx`
- `pages/CalendarPage.tsx`
- `pages/PartnerLanding.tsx`

Similar pattern - create API endpoints as needed.

---

## 🚀 Quick Refactor Script

For faster refactoring, you can use this pattern:

```bash
# Find all files using supabase
find resources/js -name "*.tsx" -exec grep -l "supabase.from" {} \;

# For each file, do a careful find/replace:
# 1. Add import: import { apiClient } from '@/lib/api-client';
# 2. Replace pattern: supabase.from('table').select() → apiClient.get('/endpoint')
# 3. Remove: import { supabase } from '@/integrations/supabase/client';
# 4. Update error handling
```

---

## ⚡ Automated Helper

Create a simple replace script:

```typescript
// refactor-helper.ts
const replacements = {
  "supabase.from('partner_commissions')": "apiClient.get('/partner/commissions')",
  "supabase.from('partner_payouts')": "apiClient.get('/partner/payouts')",
  "supabase.from('partner_deals')": "apiClient.get('/partner/deals')",
  "supabase.from('referrals')": "apiClient.get('/partner/referrals')",
  // etc...
};
```

---

##  Testing Checklist

After refactoring each section, test:

- [ ] Partner Commissions page loads
- [ ] Partner Payouts page loads
- [ ] Partner Referrals page loads and can create new referrals
- [ ] Partner Deals page loads
- [ ] Partner Marketing assets load
- [ ] Password reset works
- [ ] Partner application works
- [ ] Blog pages load (if implemented)

---

## 🎯 Estimated Time

- Partner Portal: 1-2 hours
- Authentication: 30 minutes
- Admin Tools: 1 hour (if implementing endpoints)
- Public Pages: 1 hour (if implementing endpoints)

**Total: 3-4 hours for complete refactor**

---

## 📞 Need Help?

If any file has complex Supabase queries (joins, RLS, etc.), you may need to:
1. Create more sophisticated Laravel API endpoints
2. Move business logic to backend
3. Use Eloquent relationships

Let me know which files are giving you trouble!
