# 🔍 Cynessa Chat Error Troubleshooting

## ⚠️ Error: "Unable to send message"

### First: Did You Deploy Yet?

**Important:** The code we just committed is ONLY on your local machine.

Check:
```bash
git status
git log --oneline -3
```

If you see our recent commits but they're NOT on production yet, that's not the issue.

### Quick Check: Is This a NEW Error?

**Question:** Did Cynessa work BEFORE we made these changes?

- **If YES** → The new tool code broke something
- **If NO** → This is a pre-existing issue

### Common Causes:

1. **API Key Issue** - Anthropic API key not set or invalid
2. **Database Connection** - Can't query agents table
3. **Laravel AI Package** - Not properly installed
4. **Tool Error** - GetAgentInformationTool has a bug

### Immediate Debug Steps:

#### 1. Check Production Logs:
```bash
# SSH to production
ssh your-production-server

# Check Laravel logs
tail -100 /path/to/storage/logs/laravel.log

# Look for errors related to:
# - "Cynessa"
# - "GetAgentInformationTool"
# - "Anthropic"
# - "Laravel AI"
```

#### 2. Check Environment Variables:
```bash
# On production
php artisan tinker --execute="
echo 'Anthropic Key: ' . (config('services.anthropic.api_key') ? 'SET' : 'NOT SET') . PHP_EOL;
echo 'DB Connection: ' . (DB::connection()->getPdo() ? 'OK' : 'FAILED') . PHP_EOL;
"
```

#### 3. Test Cynessa Without Tool:
```bash
# Temporarily disable tool to see if that's the issue
# This will tell us if the tool is the problem
```

### Quick Fix Options:

#### Option 1: Rollback (if tool is the issue)
```bash
# On production
git revert HEAD~3..HEAD
php artisan optimize:clear
```

#### Option 2: Fix Tool Error
If logs show specific error in GetAgentInformationTool, we can patch it.

#### Option 3: Check Portal Chat Endpoint
The frontend might be hitting the wrong endpoint or there's a CORS issue.

### What Info Do I Need?

Please provide:

1. **Production logs:** Last 50 lines with any errors
   ```bash
   tail -50 storage/logs/laravel.log | grep -A 10 -B 10 "error\|exception"
   ```

2. **Browser console errors:** Open DevTools (F12) → Console tab
   - Any red errors?
   - What's the failed request?

3. **Network tab:** DevTools → Network
   - Find the failed request (red)
   - What's the status code?
   - What's the response?

4. **Did you deploy the new code?**
   - YES → Tool might be broken in production
   - NO → This is unrelated to our changes

### Quick Test:

Try this in production tinker to see if the tool works:
```bash
php artisan tinker --execute="
try {
    \$tool = new App\Ai\Tools\GetAgentInformationTool;
    \$request = new Laravel\Ai\Tools\Request([]);
    echo \$tool->handle(\$request);
    echo PHP_EOL . '✅ Tool works!';
} catch (Exception \$e) {
    echo '❌ Tool error: ' . \$e->getMessage();
}
"
```

### Most Likely Issue:

If you HAVEN'T deployed yet → This is probably an unrelated issue with:
- Anthropic API quota/key
- Database connection
- Existing Cynessa code

If you HAVE deployed → The tool might have an error in production environment.

