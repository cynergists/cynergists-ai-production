# iDevAffiliate Implementation Guide

## 🎯 Current Status

✅ **Backend Integration:** COMPLETE
- Service: `app/Services/IDevAffiliateService.php`
- Config: `config/idevaffiliate.php`
- Tests: `tests/Feature/IDevAffiliateTest.php`
- Integration: `app/Http/Controllers/Api/PaymentController.php`

❌ **Frontend Tracking:** NEEDS IMPLEMENTATION
- Tracking script not added to pages
- Cookie/link tracking not implemented

---

## 📋 Step-by-Step Implementation

### STEP 1: Add Environment Variables

**File:** `.env`

Add these lines:
```bash
IDEVAFFILIATE_ENABLED=true
IDEVAFFILIATE_URL=https://cynergists.idevaffiliate.com/sale.php
IDEVAFFILIATE_SECRET=your_secret_key_here
IDEVAFFILIATE_PROFILE=your_profile_id_here
```

**Get your credentials from:** https://cynergists.idevaffiliate.com/admin/

---

### STEP 2: Add Tracking Script to Layout

**File:** `resources/views/app.blade.php`

Add this script **before the closing `</body>` tag**:

```html
<!-- iDevAffiliate Tracking -->
@if(config('idevaffiliate.enabled'))
<script>
(function() {
    var profile = '{{ config("idevaffiliate.profile") }}';
    var iDevUrl = 'https://cynergists.idevaffiliate.com';
    
    // Create tracking pixel
    var img = document.createElement('img');
    img.style.border = '0';
    img.style.display = 'none';
    img.style.position = 'absolute';
    img.style.top = '-9999px';
    img.src = iDevUrl + '/track.php?profile=' + profile;
    
    document.body.appendChild(img);
})();
</script>
@endif
```

---

### STEP 3: Add Thank You Page Tracking

**File:** `resources/js/cynergists/pages/Checkout.tsx` (or wherever your success page is)

After successful checkout, add:

```typescript
// After successful payment
const trackConversion = (orderData: {
    orderId: string;
    amount: number;
    email: string;
    name: string;
    products: string;
}) => {
    // Create tracking pixel
    const img = document.createElement('img');
    img.style.border = '0';
    img.style.display = 'none';
    img.style.position = 'absolute';
    img.style.top = '-9999px';
    
    const params = new URLSearchParams({
        profile: import.meta.env.VITE_IDEV_PROFILE || '',
        idev_saleamt: orderData.amount.toString(),
        idev_ordernum: orderData.orderId,
        idev_option_1: orderData.name,
        idev_option_2: orderData.email,
        idev_option_3: orderData.products,
    });
    
    img.src = `https://cynergists.idevaffiliate.com/sale.php?${params.toString()}`;
    document.body.appendChild(img);
};

// Call after successful payment
trackConversion({
    orderId: paymentId,
    amount: totalAmount,
    email: customerEmail,
    name: customerName,
    products: cartItems.map(i => i.name).join(', '),
});
```

---

### STEP 4: Add Vite Environment Variables

**File:** `.env`

Add:
```bash
VITE_IDEV_PROFILE=your_profile_id_here
```

**File:** `vite.config.ts`

Make sure env vars are exposed:
```typescript
export default defineConfig({
    // ... existing config
    define: {
        'import.meta.env.VITE_IDEV_PROFILE': JSON.stringify(process.env.VITE_IDEV_PROFILE),
    },
});
```

---

### STEP 5: Create Tracking Helper Service

**File:** `resources/js/cynergists/services/idevTracking.ts`

```typescript
interface ConversionData {
    orderId: string;
    amount: number;
    customerName?: string;
    customerEmail?: string;
    products?: string;
}

export class IDevTracking {
    private static profile = import.meta.env.VITE_IDEV_PROFILE;
    private static baseUrl = 'https://cynergists.idevaffiliate.com';

    /**
     * Track page view for affiliate cookie
     */
    static trackPageView(): void {
        if (!this.profile) {
            console.warn('iDevAffiliate: Profile ID not configured');
            return;
        }

        const img = document.createElement('img');
        img.style.border = '0';
        img.style.display = 'none';
        img.style.position = 'absolute';
        img.style.top = '-9999px';
        img.src = `${this.baseUrl}/track.php?profile=${this.profile}`;
        
        if (document.body) {
            document.body.appendChild(img);
        } else {
            window.addEventListener('DOMContentLoaded', () => {
                document.body.appendChild(img);
            });
        }
    }

    /**
     * Track conversion/sale
     */
    static trackConversion(data: ConversionData): void {
        if (!this.profile) {
            console.warn('iDevAffiliate: Profile ID not configured');
            return;
        }

        const params = new URLSearchParams({
            profile: this.profile,
            idev_saleamt: data.amount.toFixed(2),
            idev_ordernum: data.orderId,
        });

        if (data.customerName) {
            params.append('idev_option_1', data.customerName);
        }
        if (data.customerEmail) {
            params.append('idev_option_2', data.customerEmail);
        }
        if (data.products) {
            params.append('idev_option_3', data.products);
        }

        const img = document.createElement('img');
        img.style.border = '0';
        img.style.display = 'none';
        img.style.position = 'absolute';
        img.style.top = '-9999px';
        img.src = `${this.baseUrl}/sale.php?${params.toString()}`;
        
        document.body.appendChild(img);

        console.log('iDevAffiliate: Conversion tracked', data);
    }

    /**
     * Get current affiliate ID from cookie
     */
    static getAffiliateId(): string | null {
        const match = document.cookie.match(/idev_tracking_id=([^;]+)/);
        return match ? match[1] : null;
    }
}
```

---

### STEP 6: Add Tracking to Main Layout

**File:** `resources/js/app.tsx`

```typescript
import { IDevTracking } from '@/services/idevTracking';

// Add to your app initialization
useEffect(() => {
    // Track page view on mount
    IDevTracking.trackPageView();
}, []);
```

---

### STEP 7: Add Tracking to Checkout Success

**File:** `resources/js/cynergists/pages/Checkout.tsx` (or success page)

```typescript
import { IDevTracking } from '@/services/idevTracking';

// After successful payment
const handlePaymentSuccess = (paymentData: any) => {
    // Your existing success logic...
    
    // Track conversion
    IDevTracking.trackConversion({
        orderId: paymentData.paymentId,
        amount: paymentData.totalAmount,
        customerName: paymentData.customerName,
        customerEmail: paymentData.customerEmail,
        products: cartItems.map(item => item.name).join(', '),
    });
    
    // Redirect to success page...
};
```

---

### STEP 8: Test the Integration

#### Test Page Tracking:
1. Visit http://localhost/
2. Open DevTools → Network tab
3. Look for request to `cynergists.idevaffiliate.com/track.php`
4. Should see your profile ID in the URL

#### Test Conversion Tracking:
1. Complete a test purchase
2. Open DevTools → Network tab
3. Look for request to `cynergists.idevaffiliate.com/sale.php`
4. Should see order details in the URL

#### Check Cookies:
1. Open DevTools → Application → Cookies
2. Look for `idev_tracking_id` cookie
3. This stores the affiliate ID

---

### STEP 9: Verify Backend Integration

```bash
# Check if environment variables are set
./vendor/bin/sail artisan tinker

# In tinker:
config('idevaffiliate.enabled')    // Should return true
config('idevaffiliate.secret')     // Should return your secret
config('idevaffiliate.profile')    // Should return your profile ID
```

---

### STEP 10: Test End-to-End

1. **With Affiliate Link:**
   - Visit: `http://localhost/?idev_id=1` (replace 1 with a test affiliate ID)
   - Cookie should be set
   - Complete a purchase
   - Check iDevAffiliate admin panel for the commission

2. **Without Affiliate Link:**
   - Visit: `http://localhost/`
   - No affiliate cookie
   - Complete a purchase
   - No commission should be recorded

---

## 🔍 Debugging

### Check if tracking is working:

```javascript
// In browser console
document.cookie.split(';').find(c => c.includes('idev'))
```

### Check backend logs:

```bash
./vendor/bin/sail logs | grep iDevAffiliate
```

### View recent commissions:

Visit: https://cynergists.idevaffiliate.com/admin/

---

## 📋 Configuration Checklist

- [ ] Add `IDEVAFFILIATE_ENABLED=true` to `.env`
- [ ] Add `IDEVAFFILIATE_SECRET` to `.env`
- [ ] Add `IDEVAFFILIATE_PROFILE` to `.env`
- [ ] Add `VITE_IDEV_PROFILE` to `.env`
- [ ] Add tracking script to `app.blade.php`
- [ ] Create `services/idevTracking.ts`
- [ ] Add page view tracking to `app.tsx`
- [ ] Add conversion tracking to checkout success
- [ ] Test with affiliate link
- [ ] Verify in iDevAffiliate admin panel

---

## 🎯 How It Works

### Flow:
1. **User clicks affiliate link:** `cynergists.ai/?idev_id=123`
2. **Tracking pixel fires:** Sets `idev_tracking_id` cookie
3. **User browses site:** Cookie persists
4. **User completes purchase:** 
   - Frontend: Fires conversion pixel
   - Backend: Reports to iDevAffiliate API
5. **Commission recorded:** Visible in iDevAffiliate admin

### Backend (Already Complete):
- `PaymentController` automatically reports sales
- Uses `IDevAffiliateService`
- Sends: Order ID, Amount, Customer Info, Products
- Logs all attempts (success/failure)

### Frontend (You Need to Add):
- Track page views (sets affiliate cookie)
- Track conversions (confirms sale)
- Pass data to backend via checkout form

---

## 🚨 Important Notes

1. **Two-way tracking:** Both frontend pixel AND backend API call
2. **Cookie lifetime:** 30-90 days (set in iDevAffiliate admin)
3. **Testing:** Use `?idev_id=test` for testing
4. **Production:** Make sure URLs don't have `localhost`
5. **HTTPS:** iDevAffiliate tracking requires HTTPS in production

---

## 📞 Support

**iDevAffiliate Admin:** https://cynergists.idevaffiliate.com/admin/  
**Documentation:** https://www.idevdirect.com/  
**Commission Code Page:** https://cynergists.idevaffiliate.com/commission_code.php

---

## ✅ Quick Start (TL;DR)

```bash
# 1. Add to .env
echo "IDEVAFFILIATE_ENABLED=true" >> .env
echo "IDEVAFFILIATE_PROFILE=YOUR_PROFILE_ID" >> .env
echo "VITE_IDEV_PROFILE=YOUR_PROFILE_ID" >> .env
echo "IDEVAFFILIATE_SECRET=YOUR_SECRET" >> .env

# 2. Create tracking service
# (Copy code from STEP 5 above)

# 3. Add to app.tsx
# (See STEP 6 above)

# 4. Add to checkout success
# (See STEP 7 above)

# 5. Rebuild
./vendor/bin/sail npm run build

# 6. Test
# Visit with ?idev_id=test and complete a purchase
```

Done! 🎉
