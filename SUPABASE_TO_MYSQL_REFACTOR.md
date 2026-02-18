# 🔄 Complete Supabase to MySQL Refactoring Plan

## 📊 Audit Results: 38 Files Using Supabase

### Categories:

1. **Partner Portal** (11 files) - Partner dashboard, commissions, deals, payouts, referrals
2. **Admin/Debug** (5 files) - Staff management, analytics, debug tools  
3. **Authentication** (3 files) - Password reset, partner application
4. **Public Pages** (4 files) - Blog, calendar, partner landing
5. **Checkout/Payments** (2 files) - Agreement review, payment processing
6. **Contracts** (2 files) - Contract version management
7. **Hooks** (9 files) - Data fetching hooks
8. **Core** (2 files) - Supabase client, types

---

## 🎯 Refactoring Strategy

### Phase 1: Core Infrastructure ✅
- [x] Replace Supabase client with no-op fallback
- [x] Remove @supabase/supabase-js from package.json
- [x] Document that Supabase is deprecated

### Phase 2: Critical User-Facing (HIGH PRIORITY)
These are actively used and will break:

#### A. Partner Portal (CRITICAL)
- [ ] `pages/partner/Commissions.tsx` - Replace with Laravel API
- [ ] `pages/partner/Payouts.tsx` - Replace with Laravel API
- [ ] `pages/partner/Referrals.tsx` - Replace with Laravel API
- [ ] `pages/partner/Deals.tsx` - Replace with Laravel API
- [ ] `pages/partner/Marketplace.tsx` - Replace with Laravel API
- [ ] `pages/partner/Marketing.tsx` - Replace with Laravel API
- [ ] `pages/partner/Reports.tsx` - Replace with Laravel API

#### B. Authentication (CRITICAL)
- [ ] `pages/auth/ForgotPassword.tsx` - Use Laravel password reset
- [ ] `pages/auth/ResetPassword.tsx` - Use Laravel password reset
- [ ] `pages/auth/PartnerApplication.tsx` - Replace with Laravel API

### Phase 3: Admin/Internal Tools (MEDIUM PRIORITY)
- [ ] `hooks/useDebugData.ts` - Admin debug tool
- [ ] `hooks/useClarityAnalytics.ts` - Microsoft Clarity analytics
- [ ] `hooks/useSquareAnalytics.ts` - Square analytics
- [ ] `hooks/usePlatformAnalytics.ts` - Platform analytics
- [ ] `hooks/useStaffList.ts` - Staff management
- [ ] `hooks/useCategoriesQueries.ts` - Category management

### Phase 4: Public/Marketing (LOW PRIORITY)
- [ ] `pages/Blog.tsx` - Blog listing
- [ ] `pages/BlogPost.tsx` - Blog post detail
- [ ] `pages/CalendarPage.tsx` - Calendar booking
- [ ] `pages/PartnerLanding.tsx` - Partner landing pages
- [ ] `pages/partners/LinkedInOutreachPartner.tsx` - Product landing

### Phase 5: Checkout/Contracts (ALREADY USES LARAVEL)
- [ ] Review and verify these use Laravel API
- [ ] `components/checkout/PaymentStep.tsx` 
- [ ] `components/checkout/AgreementReviewStep.tsx`
- [ ] `components/contracts/CreateVersionModal.tsx`
- [ ] `components/contracts/NotifyCustomersDialog.tsx`

---

## 🛠️ Refactoring Pattern

### Before (Supabase):
```typescript
import { supabase } from '@/integrations/supabase/client';

const { data } = await supabase
    .from('table_name')
    .select('*')
    .eq('id', id);
```

### After (Laravel API):
```typescript
const response = await fetch('/api/endpoint', {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    credentials: 'include',
});

const data = await response.json();
```

---

## 📋 Execution Plan

### Step 1: Create Laravel API Endpoints
For each Supabase table, create corresponding Laravel endpoint:

```php
// routes/api.php
Route::middleware('auth')->prefix('partner')->group(function () {
    Route::get('/commissions', [PartnerController::class, 'commissions']);
    Route::get('/payouts', [PartnerController::class, 'payouts']);
    Route::get('/referrals', [PartnerController::class, 'referrals']);
    Route::get('/deals', [PartnerController::class, 'deals']);
    // etc...
});
```

### Step 2: Create Controllers
```php
// app/Http/Controllers/Api/PartnerController.php
public function commissions(Request $request)
{
    $partner = $request->user()->partner;
    
    $commissions = PartnerCommission::where('partner_id', $partner->id)
        ->with('deal')
        ->orderBy('created_at', 'desc')
        ->get();
    
    return response()->json($commissions);
}
```

### Step 3: Update Frontend
Replace Supabase calls with fetch to Laravel API

### Step 4: Test Each Feature
Verify functionality works with MySQL backend

---

## 🚀 Quick Start

To begin refactoring, I'll:
1. Start with **Partner Portal** (most critical)
2. Create Laravel API endpoints
3. Update frontend components
4. Test each feature
5. Move to next priority

---

## ⚠️ Current State

**Working:**
- ✅ Public marketplace (uses Laravel API)
- ✅ Portal chat (uses Laravel API)
- ✅ Payments (uses Laravel API)

**Broken (using Supabase):**
- ❌ Partner portal pages
- ❌ Partner analytics
- ❌ Admin analytics
- ❌ Blog system
- ❌ Some auth flows

**Impact:** Features that query Supabase will show empty data or errors.

---

## 📞 Next Steps

Do you want me to:
1. **Start with Partner Portal** (commissions, payouts, referrals) - Most critical
2. **Start with Authentication** (password reset, partner app) - User-facing
3. **Create all API endpoints first** - Then update frontend in bulk
4. **Do it all at once** - Complete migration (will take time)

Let me know your priority and I'll execute the refactoring!
