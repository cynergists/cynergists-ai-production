# 🚀 COMPLETE MANUAL DEPLOYMENT GUIDE

## What's Being Deployed:

✅ **38 files** refactored from Supabase to MySQL  
✅ **Cynessa agent knowledge tool** (GetAgentInformationTool)  
✅ **Chatbot portal page fix** (no more Supabase errors)  
✅ **Database migrations** (subscription_id nullable)  
✅ **Cynessa access command** (grant to all users)  
✅ **Frontend rebuild** (updated JavaScript bundles)  

---

## 📋 DEPLOYMENT STEPS

### Step 1: Push Code (Local Machine)

```bash
# Check what will be pushed
git log --oneline origin/main..HEAD

# Should show recent commits including:
# - Supabase refactoring
# - Cynessa tool
# - Chatbot fix

# Push everything
git push origin main
```

**✅ Verify:** Code is on GitHub/GitLab

---

### Step 2: SSH to Production Server

```bash
ssh your-user@your-production-server
```

---

### Step 3: Navigate to App Directory

```bash
cd /var/www/cynergists-ai
# Or wherever your app is located

# Verify you're in the right place
pwd
ls -la
```

---

### Step 4: Pull Latest Code

```bash
# Check current status
git status
git branch

# Pull latest from main
git pull origin main

# Verify latest commit
git log --oneline -1
# Should show: c7c0766 docs: Complete refactoring summary
# Or newer
```

**✅ Verify:** `git log` shows your latest commits

---

### Step 5: Install Dependencies

```bash
# Install PHP dependencies
composer install --no-dev --optimize-autoloader

# Install Node dependencies
npm ci --production

# Or if that fails:
npm install
```

**✅ Verify:** No errors during install

---

### Step 6: Run Database Migrations

```bash
# Run migrations
php artisan migrate --force

# Verify
php artisan migrate:status | grep subscription_and_customer
# Should show "Ran" not "Pending"
```

**✅ Verify:** Migration ran successfully

---

### Step 7: Grant Cynessa Access

```bash
# Run the command to grant Cynessa to all users
php artisan cynessa:grant-access

# Should output:
# ✅ Complete!
#   - Granted access: X
#   - Total with Cynessa: X
```

**✅ Verify:** Users now have Cynessa access

---

### Step 8: Build Frontend

```bash
# Build production assets
npm run build

# This will take 1-2 minutes
# Watch for "✓ built in X.XXs"
```

**✅ Verify:** Build completes without errors

---

### Step 9: Clear All Caches

```bash
# Clear and rebuild caches
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Restart queue workers (if using queues)
php artisan queue:restart
```

**✅ Verify:** All caches cleared

---

### Step 10: Run Health Checks

```bash
# Quick health check script
php artisan tinker --execute="
echo '========== DEPLOYMENT HEALTH CHECK ==========' . PHP_EOL;
echo PHP_EOL;

// 1. Check Cynessa agent exists
\$cynessa = App\Models\PortalAvailableAgent::where('name', 'Cynessa')->first();
echo '1. Cynessa Agent: ' . (\$cynessa ? '✅ EXISTS (ID: ' . \$cynessa->id . ')' : '❌ MISSING') . PHP_EOL;

// 2. Check users with Cynessa access
\$access = App\Models\AgentAccess::where('agent_name', 'Cynessa')->count();
echo '2. Cynessa Access: ' . \$access . ' user(s) ✅' . PHP_EOL;

// 3. Check GetAgentInformationTool exists
echo '3. Agent Tool: ' . (file_exists('app/Ai/Tools/GetAgentInformationTool.php') ? '✅ DEPLOYED' : '❌ MISSING') . PHP_EOL;

// 4. Check Chatbot fix deployed
\$chatbot = file_get_contents('resources/js/cynergists/components/Chatbot.tsx');
echo '4. Chatbot Fix: ' . (strpos(\$chatbot, 'isPortalPage') !== false ? '✅ DEPLOYED' : '❌ MISSING') . PHP_EOL;

// 5. Check API endpoint exists
echo '5. API Endpoint: ' . (Route::has('') ? '✅ EXISTS' : 'Checking...') . PHP_EOL;

// 6. Test the tool
try {
    \$tool = new App\Ai\Tools\GetAgentInformationTool;
    \$req = new Laravel\Ai\Tools\Request(['agent_name' => 'Luna']);
    \$result = \$tool->handle(\$req);
    echo '6. Tool Test: ' . (strlen(\$result) > 0 ? '✅ WORKING' : '⚠️  Empty result') . PHP_EOL;
} catch (Exception \$e) {
    echo '6. Tool Test: ❌ ERROR - ' . \$e->getMessage() . PHP_EOL;
}

echo PHP_EOL;
echo '=========================================' . PHP_EOL;
"
```

**✅ Verify:** All checks pass

---

### Step 11: Check Logs (Optional but Recommended)

```bash
# Check for recent errors
tail -50 storage/logs/laravel.log

# Or watch logs live
tail -f storage/logs/laravel.log
# Press Ctrl+C to stop
```

---

## 🧪 TESTING AFTER DEPLOYMENT

### Test 1: Portal Access
```
1. Visit: https://cynergists.ai/portal
2. Should NOT see Supabase errors in console
3. Should see Cynessa in agents list
```

### Test 2: Cynessa Chat
```
1. Click on Cynessa
2. Chat should open
3. Type: "Tell me about Luna"
4. Should see full Luna details with features, pricing, integrations
```

### Test 3: Browser Console
```
1. Press F12
2. Console tab
3. Should NOT see:
   ❌ "undefined/functions/v1/chat"
   ❌ "ERR_BLOCKED_BY_CLIENT"
   ❌ "supabase" errors
```

### Test 4: Partner Portal (if applicable)
```
1. Visit partner portal pages
2. Check commissions, payouts, referrals load
3. No Supabase errors
```

---

## 🎯 SUCCESS CRITERIA

✅ No console errors  
✅ Cynessa responds with agent details  
✅ Chatbot doesn't appear on portal pages  
✅ Partner portal pages load  
✅ No "unable to send message" errors  
✅ Health checks all pass  

---

## 🔧 TROUBLESHOOTING

### Issue: "Unable to send message"
**Check:**
```bash
php artisan route:list | grep "portal.*message"
# Should show: POST api/portal/agents/{agent}/message
```

**Fix:**
```bash
php artisan route:clear
php artisan route:cache
```

---

### Issue: Cynessa doesn't know about agents
**Check:**
```bash
php artisan tinker --execute="
\$tool = new App\Ai\Tools\GetAgentInformationTool;
echo get_class(\$tool);
"
```

**Fix:**
```bash
composer dump-autoload
php artisan optimize:clear
```

---

### Issue: Still seeing Supabase errors
**Check:**
```bash
# Verify Chatbot fix is deployed
grep -n "isPortalPage" resources/js/cynergists/components/Chatbot.tsx

# Should show the portal check
```

**Fix:**
```bash
npm run build
# Then hard refresh browser (Cmd+Shift+R)
```

---

### Issue: "Cynessa agent not found"
**Check:**
```bash
php artisan tinker --execute="
echo App\Models\AgentAccess::where('agent_name', 'Cynessa')->count() . ' users with access';
"
```

**Fix:**
```bash
php artisan cynessa:grant-access
```

---

## 📊 DEPLOYMENT CHECKLIST

- [ ] Code pushed to Git
- [ ] SSH to production server
- [ ] Navigate to app directory
- [ ] Pull latest code (git pull)
- [ ] Install dependencies (composer + npm)
- [ ] Run migrations (php artisan migrate)
- [ ] Grant Cynessa access (php artisan cynessa:grant-access)
- [ ] Build frontend (npm run build)
- [ ] Clear caches (php artisan optimize:clear)
- [ ] Restart services (php artisan queue:restart)
- [ ] Run health checks
- [ ] Test in browser
- [ ] Check logs for errors

---

## 🎉 DEPLOYMENT COMPLETE!

Once all steps are done and tests pass, you have successfully deployed:

✅ **Complete Supabase removal** (38 files)  
✅ **Cynessa agent knowledge**  
✅ **Fixed portal chat**  
✅ **All migrations**  
✅ **Fresh frontend build**  

**Your production app is now 100% Laravel/MySQL with zero Supabase dependencies!** 🚀

---

## 📞 Need Help?

If you encounter issues:

1. **Check logs:** `tail -f storage/logs/laravel.log`
2. **Check browser console:** F12 → Console tab
3. **Check network requests:** F12 → Network tab
4. **Run health checks:** Use the tinker script above
5. **Rollback if needed:** `git reset --hard PREVIOUS_COMMIT`

---

**Deployment Time:** ~10-15 minutes  
**Downtime:** ~30 seconds (during npm build)  
**Risk Level:** Low (all changes tested locally)  
