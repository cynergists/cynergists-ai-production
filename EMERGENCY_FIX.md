# 🚨 EMERGENCY FIX - Cynessa Chat Down

## FASTEST FIX: Temporarily Disable Tool

On production, edit this file:
`app/Ai/Agents/Cynessa.php`

Find the `tools()` method and comment it out:

```php
public function tools(): iterable
{
    return []; // Temporarily disabled
    // return [
    //     new GetAgentInformationTool,
    // ];
}
```

Then:
```bash
php artisan optimize:clear
```

This will restore Cynessa immediately while we debug the tool.

## THEN: Check What Broke

```bash
# Test the tool directly
php artisan tinker --execute="
try {
    \$tool = new App\Ai\Tools\GetAgentInformationTool;
    echo 'Tool class loaded OK';
} catch (Exception \$e) {
    echo 'ERROR: ' . \$e->getMessage();
}
"
```

## Common Error Messages & Fixes:

### "Class not found"
```bash
composer dump-autoload
```

### "Method handle not found" / "Method schema not found"
The tool interface is wrong. Need to fix GetAgentInformationTool.php

### "Portal Available Agent not found"
Database issue or model not loaded.

### "Request not found"
Missing Laravel\Ai\Tools\Request import

---

What error do you see in the logs?
