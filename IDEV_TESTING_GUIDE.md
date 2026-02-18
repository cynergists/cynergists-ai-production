# iDevAffiliate Testing Guide


## ✅ Implementation Complete!

### What Was Implemented:

1. **✅ IDevTracking Service** - `resources/js/cynergists/services/idevTracking.ts`
2. **✅ Page View Tracking** - Fires on every page load
3. **✅ Conversion Tracking** - Fires on successful checkout
4. **✅ Backend Integration** - Already working (PaymentController)

---

## 🧪 How to Test

### Test 1: Page View Tracking (Cookie Tracking)

**Steps:**
1. Open browser: http://localhost/?idev_id=test
2. Open DevTools (F12) → Network tab
3. Look for request to: `cynergists.idevaffiliate.com/track.php`
4. Should see: `?profile=72198` in the URL

**Expected Result:**
- Tracking pixel loads
- Cookie `idev_tracking_id` is set
- Console logs: "iDevAffiliate: Page view tracked"

**Check Cookie:**
```javascript
// In browser console:
document.cookie.split(';').find(c => c.includes('idev'))
```

Should show something like: `idev_tracking_id=test`

---

### Test 2: Verify Tracking Without Affiliate Link

**Steps:**
1. Clear cookies (DevTools → Application → Clear site data)
2. Visit: http://localhost/ (no ?idev_id parameter)
3. Open DevTools → Network tab
4. Should still see tracking pixel load
5. BUT no affiliate ID in cookie

**Expected Result:**
- Tracking fires (page view)
- No `idev_tracking_id` cookie set
- No commission will be recorded on purchases

---

### Test 3: End-to-End Conversion Tracking

**Steps:**
1. **Set up test affiliate:**
   - Visit: http://localhost/?idev_id=999
   - Verify cookie is set (DevTools → Application → Cookies)

2. **Add item to cart:**
   - Navigate to marketplace
   - Add an agent to cart

3. **Go to checkout:**
   - Visit /cart
   - Click "Check Out"

4. **Complete payment:**
   - Fill out billing form
   - Use test credit card: `4111 1111 1111 1111`
   - Submit payment

5. **Watch Network tab:**
   - Should see request to: `cynergists.idevaffiliate.com/sale.php`
   - Parameters should include:
     - `profile=72198`
     - `idev_saleamt=XX.XX` (amount paid)
     - `idev_ordernum=sq-XXX` (order ID)
     - `idev_option_1=Customer Name`
     - `idev_option_2=customer@email.com`
     - `idev_option_3=Agent Name`

6. **Check console:**
   - Should see: "iDevAffiliate: Conversion tracked"

---

### Test 4: Verify in iDevAffiliate Admin

**Steps:**
1. Login to: https://cynergists.idevaffiliate.com/admin/
2. Go to: "Approved Commissions" or "Pending Commissions"
3. Look for the test order

**Expected Result:**
- Order appears with correct amount
- Affiliate ID matches (999 in test)
- Customer info is correct
- Product info shows agent names

---

## 🐛 Troubleshooting

### Issue: No tracking pixel fires

**Check:**
```bash
# Verify app is running
curl http://localhost/

# Check if service is created
ls resources/js/cynergists/services/idevTracking.ts

# Rebuild if needed
./vendor/bin/sail npm run build
```

### Issue: Cookie not being set

**Cause:** Browser blocks third-party cookies

**Solution:** 
- Test in production (HTTPS)
- Or allow third-party cookies in browser settings

### Issue: Conversion not showing in admin

**Possible causes:**
1. Wrong affiliate ID (doesn't exist)
2. Cookie expired before purchase
3. Backend integration has wrong secret/profile
4. Firewall blocking request

**Check backend logs:**
```bash
./vendor/bin/sail logs | grep iDevAffiliate
```

Should see: "iDevAffiliate commission reported"

---

## 📊 What Gets Tracked

### Page View (track.php):
- **When:** Every page load
- **What:** Sets affiliate cookie
- **Duration:** 30-90 days (configurable in iDev admin)

### Conversion (sale.php):
- **When:** After successful checkout
- **What:** Reports sale to iDevAffiliate
- **Data Sent:**
  - Order ID (subscription ID or payment ID)
  - Sale amount (total paid)
  - Customer name
  - Customer email
  - Product names (comma-separated)

### Backend API (via PaymentController):
- **When:** After successful payment
- **What:** Server-side commission report
- **Endpoint:** `https://cynergists.idevaffiliate.com/sale.php`
- **Why:** Backup in case frontend tracking fails

---

## 🔍 Debug Commands

### Check if tracking is working:

**Browser Console:**
```javascript
// Check if service loaded
window.IDevTracking

// Check cookie
document.cookie.split(';').find(c => c.includes('idev'))

// Manually fire page view (for testing)
// (Service not exposed globally, but fires automatically)
```

**Check Network Tab:**
- Look for `track.php` (page views)
- Look for `sale.php` (conversions)

### Check Backend Config:

```bash
./vendor/bin/sail artisan tinker

# Run these commands:
config('idevaffiliate.enabled')    // Should be true
config('idevaffiliate.profile')    // Should be 72198
config('idevaffiliate.secret')     // Should be 70860774
```

### View Backend Logs:

```bash
# Recent iDev activity
./vendor/bin/sail logs --tail=100 | grep -i idev

# Watch live
./vendor/bin/sail logs --follow | grep -i idev
```

---

## ✅ Verification Checklist

- [ ] Page tracking fires on home page visit
- [ ] Cookie `idev_tracking_id` is set when visiting with `?idev_id=X`
- [ ] Conversion tracking fires after successful checkout
- [ ] Network tab shows both `track.php` and `sale.php` requests
- [ ] Console shows "Page view tracked" and "Conversion tracked"
- [ ] Backend logs show "iDevAffiliate commission reported"
- [ ] Commission appears in iDevAffiliate admin panel
- [ ] Customer info is correct in admin panel
- [ ] Sale amount matches actual payment

---

## 🎯 Production Testing

### Before Going Live:

1. **Test with real affiliate link:**
   - Get a real affiliate link from iDevAffiliate
   - Format: `https://cynergists.ai/?idev_id=123`
   - Complete a test purchase
   - Verify commission appears in admin

2. **Test cookie persistence:**
   - Visit with affiliate link
   - Navigate around site
   - Wait 5 minutes
   - Complete purchase
   - Should still track commission

3. **Test without affiliate:**
   - Clear cookies
   - Visit site directly (no idev_id)
   - Complete purchase
   - Should NOT create commission

---

## 📞 Support

**iDevAffiliate Admin Panel:**
https://cynergists.idevaffiliate.com/admin/

**Your Settings:**
- Profile ID: 72198
- Secret Key: 70860774 (stored in .env)
- Base URL: https://cynergists.idevaffiliate.com

**Documentation:**
https://www.idevdirect.com/

---

## 🎉 Success!

Your iDevAffiliate tracking is now fully implemented with:
- ✅ Frontend page view tracking
- ✅ Frontend conversion tracking
- ✅ Backend commission reporting
- ✅ Full error handling and logging

Test it now with: `http://localhost/?idev_id=test`
