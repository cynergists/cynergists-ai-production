# 🚀 Deploying Cynessa Agent Knowledge Tool to Production

## Files Changed (3 commits):

```
00b529a - feat: Add dynamic agent knowledge tool for Cynessa
38e336c - feat: Add payment debugging tools and fix API error handling  
fd22fab - fix: Add explicit tool usage instructions to Cynessa
```

## 📦 What Was Added:

### New Files:
1. `app/Ai/Tools/GetAgentInformationTool.php` - The tool that queries agents
2. `CYNESSA_AGENT_KNOWLEDGE_TEST.md` - Testing documentation

### Modified Files:
1. `app/Ai/Agents/Cynessa.php` - Added HasTools interface and tool registration

## 🚀 Deployment Steps:

### Step 1: Push to Production

```bash
# From main branch (already done locally)
git push origin main
```

### Step 2: Deploy on Production Server

```bash
# SSH into production
ssh your-production-server

# Pull latest code
cd /path/to/app
git pull origin main

# Clear all caches (IMPORTANT)
php artisan config:clear
php artisan route:clear
php artisan cache:clear
php artisan view:clear

# Restart queue workers if using them
php artisan queue:restart
```

### Step 3: Verify Tool is Available

```bash
# On production server
php artisan tinker --execute="
\$user = App\Models\User::first();
\$tenant = App\Models\PortalTenant::first();
\$cynessa = new App\Ai\Agents\Cynessa(\$user, \$tenant);
\$tools = iterator_to_array(\$cynessa->tools());
echo 'Tools available: ' . count(\$tools) . PHP_EOL;
foreach (\$tools as \$tool) {
    echo '  ✅ ' . get_class(\$tool) . PHP_EOL;
}
"
```

**Expected Output:**
```
Tools available: 1
  ✅ App\Ai\Tools\GetAgentInformationTool
```

### Step 4: Test Tool Directly

```bash
php artisan tinker --execute="
\$tool = new App\Ai\Tools\GetAgentInformationTool;
\$request = new Laravel\Ai\Tools\Request(['agent_name' => 'Luna']);
echo \$tool->handle(\$request);
"
```

**Expected:** Should return Luna's full details

### Step 5: Test in Production Chat

1. Login to production portal
2. Open Cynessa chat
3. Ask: "Tell me about Luna"
4. Verify response includes current Luna details from database

## ⚠️ If Tool Doesn't Work:

### Issue: "Class not found"

**Solution:**
```bash
# Regenerate autoload files
composer dump-autoload

# Clear all caches
php artisan optimize:clear
```

### Issue: Tool registered but not being called

**Check Laravel AI logs:**
```bash
tail -f storage/logs/laravel.log | grep "Laravel AI"
```

**Check Anthropic is using tools:**
- Ensure API key is set: `ANTHROPIC_API_KEY`
- Check model supports tools: `claude-sonnet-4-5-20250929` ✅

### Issue: Tool returns empty data

**Check database:**
```bash
php artisan tinker --execute="
echo 'Active agents: ' . App\Models\PortalAvailableAgent::where('is_active', true)->count();
"
```

If 0, run seeder:
```bash
php artisan db:seed --class=PortalAvailableAgentsSeeder
```

## ✅ Verification Checklist

After deployment, verify:

- [ ] Code pulled to production
- [ ] All caches cleared
- [ ] Tool shows in `$cynessa->tools()`
- [ ] Tool can query database
- [ ] Active agents count > 0
- [ ] Test question in chat gets tool response
- [ ] Response includes current pricing
- [ ] Response includes current features

## 🧪 Test Questions for Production:

```
1. "What agents do you have?"
   Expected: Lists all 23+ agents with prices

2. "Tell me about Luna"
   Expected: Full Luna details with current price

3. "How much does Carbon cost?"
   Expected: Current Carbon pricing ($197/mo)

4. "What features does Apex have?"
   Expected: Lists Apex features from database

5. "Which agent is best for SEO?"
   Expected: Uses tool, recommends Carbon with details
```

## 📊 Monitoring

After deployment, monitor:

```bash
# Watch for errors
tail -f storage/logs/laravel.log | grep -i "cynessa\|getagenttool"

# Check API usage
# (Monitor Anthropic dashboard for increased tool usage)
```

## 🎯 Expected Behavior

**Before:** Cynessa couldn't answer specific agent questions accurately

**After:** Cynessa uses the tool and answers with:
- ✅ Current pricing from database
- ✅ Current features list
- ✅ Current integrations
- ✅ Accurate descriptions
- ✅ Works for all agents including newly added ones

## 🚨 Rollback Plan (if needed)

If something breaks:

```bash
# Revert to previous commit
git revert fd22fab 00b529a
git push origin main

# On production
git pull origin main
php artisan optimize:clear
```

## 📞 Support

If issues persist:
1. Check Laravel logs: `storage/logs/laravel.log`
2. Check Anthropic API status
3. Verify database has agent data
4. Test tool in tinker directly

---

## ✅ Success!

Once deployed, Cynessa will automatically have knowledge of all agents in the database - no more manual updates needed! 🎉
