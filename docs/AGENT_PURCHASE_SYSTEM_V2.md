# Agent Purchase & Attachment System

## Overview

When a user purchases AI agents through the checkout process, the system immediately attaches those agents to their portal tenant, giving them instant access to the purchased agents. The system uses a **service-based architecture** for clean, synchronous execution with proper transaction handling.

## Architecture: Service vs Job

### Why We Use a Service Pattern

The system uses `AgentAttachmentService` as the primary implementation because:

1. **Immediate Access**: Users get instant access to purchased agents after payment completes
2. **Simpler Flow**: Direct execution makes debugging and testing easier
3. **Transaction Safety**: Database transactions ensure data consistency
4. **Better UX**: No waiting for background jobs - agents available immediately
5. **Clearer Code**: Single responsibility, no queue infrastructure complexity
6. **Easier Testing**: Direct service calls are simpler to test than job dispatch/execution

### When to Use the Job Wrapper

The `AttachPortalAgentsToUser` job is available as a thin wrapper around the service for scenarios requiring:

- **Async Processing**: When you don't want to block the HTTP response
- **Retry Logic**: Automatic retries for transient failures
- **CLI Operations**: For bulk operations or manual admin tasks via Artisan commands

## Flow

### 1. User Adds Agents to Cart
- Users browse available agents in the marketplace
- Click "Add to Cart" to add agents
- Cart items include agent name, price, and billing period

### 2. Checkout Process
- User proceeds to checkout at `/checkout`
- If not logged in, user can:
  - Enter email to check if account exists
  - Login (if existing user)
  - Register new account (if new user)
- Complete payment using Square (production) or test card (sandbox)

### 3. Payment Processing
**File**: `app/Http/Controllers/Api/PaymentController.php`

When payment is successful:

```php
// 1. Process payment through Square API
$response = $this->squareClient->payments->create($paymentRequest);

// 2. Find user by email
$user = User::where('email', $validated['customer_email'])->first();

// 3. Extract purchased agent names from cart items
$purchasedAgentNames = array_map(
    fn ($item) => $item['name'],
    $validated['cart_items']
);

// 4. Attach agents immediately via service
$attachmentService = app(AgentAttachmentService::class);
$result = $attachmentService->attachAgentsToUser(
    $user->email,
    $purchasedAgentNames,
    companyName: null,
    subdomain: null
);

// 5. Log the result
if ($result['success']) {
    Log::info('Successfully attached agents', [
        'user_email' => $user->email,
        'agents_attached' => $result['agents_attached'],
        'tenant_id' => $result['tenant_id'],
    ]);
} else {
    Log::error('Failed to attach agents', [
        'user_email' => $user->email,
        'error' => $result['message'],
    ]);
}
```

### 4. Agent Attachment Service
**File**: `app/Services/AgentAttachmentService.php`

The service runs synchronously and:

#### Core Logic
```php
public function attachAgentsToUser(
    string $email,
    ?array $agentNames = null,  // null = all active agents
    ?string $companyName = null,
    ?string $subdomain = null
): array
```

#### Steps:
1. **Find User**: Looks up user by email
2. **Get or Create Tenant**: 
   - Checks if user has existing portal tenant
   - Creates new tenant if none exists
3. **Get or Create Subscription**:
   - Finds active subscription for tenant
   - Creates new "starter" tier subscription if needed
4. **Filter Agents**:
   - If `$agentNames` provided: Only attach those specific agents
   - If `$agentNames` is null: Attach ALL active agents
5. **Attach Agents**:
   - Creates `agent_access` records for each agent
   - Links to tenant and subscription
   - Updates existing access if agent already attached
6. **Return Result**:
   ```php
   return [
       'success' => true,
       'tenant_id' => 'uuid-here',
       'agents_attached' => 2,
       'message' => 'Successfully attached 2 agents'
   ];
   ```

#### Transaction Safety
All operations wrapped in database transaction:
```php
return DB::transaction(function () use ($email, $agentNames, $companyName, $subdomain) {
    // All operations here...
    // Rolled back automatically if any error occurs
});
```

#### Error Handling
```php
try {
    return DB::transaction(/* ... */);
} catch (\Exception $e) {
    Log::error('Failed to attach agents', [
        'email' => $email,
        'error' => $e->getMessage(),
    ]);
    
    return [
        'success' => false,
        'tenant_id' => null,
        'agents_attached' => 0,
        'message' => "Failed to attach agents: {$e->getMessage()}",
    ];
}
```

### 5. Job Wrapper (Optional)
**File**: `app/Jobs/AttachPortalAgentsToUser.php`

For async scenarios, the job delegates to the service:

```php
public function handle(AgentAttachmentService $service): void
{
    $result = $service->attachAgentsToUser(
        $this->email,
        $this->agentNames,
        $this->companyName,
        $this->subdomain
    );

    if (!$result['success']) {
        Log::error('Job failed to attach agents', [
            'email' => $this->email,
            'error' => $result['message'],
        ]);
    }
}
```

Usage:
```php
// Dispatch async
AttachPortalAgentsToUser::dispatch(
    $user->email,
    $purchasedAgents,
    companyName: null,
    subdomain: null
);
```

## Database Schema

### portal_tenants
- `id` (UUID): Primary key
- `user_id` (UUID): Foreign key to users table
- `company_name` (string): Company/tenant name
- `subdomain` (string): Unique subdomain (e.g., "acme-test")
- `status` (string): Tenant status (default: 'active')

### customer_subscriptions
- `id` (UUID): Primary key
- `customer_id` (UUID): Foreign key to portal tenant
- `tenant_id` (UUID): Foreign key to portal tenant
- `status` (string): Subscription status (default: 'active')
- `tier` (string): Subscription tier (default: 'starter')

### agent_access
- `id` (UUID): Primary key
- `tenant_id` (UUID): Foreign key to portal_tenants
- `subscription_id` (UUID): Foreign key to customer_subscriptions
- `agent_name` (string): Name of the agent (matches portal_available_agents.name)
- `agent_type` (string): Category of agent
- `is_active` (boolean): Whether agent access is active
- `usage_count` (integer): How many times agent has been used

### portal_available_agents
- `id` (UUID): Primary key
- `name` (string): Display name (used as agent identifier)
- `category` (string): Agent category
- `price` (decimal): Monthly price
- `is_active` (boolean): Whether agent is available for purchase

## Testing

**File**: `tests/Feature/AgentAttachmentServiceTest.php`

Test suite covers:

### 1. Attaches Purchased Agents
```php
it('attaches purchased agents to user via service', function () {
    $user = User::factory()->create(['email' => 'customer@example.com']);
    $purchasedAgents = ['Sales Agent', 'Support Agent'];

    $service = app(AgentAttachmentService::class);
    $result = $service->attachAgentsToUser($user->email, $purchasedAgents);

    expect($result['success'])->toBeTrue();
    expect($result['agents_attached'])->toBe(2);
    // ... additional assertions
});
```

### 2. Only Attaches Specified Agents
Tests that when `$agentNames` is provided, only those agents are attached (not all available agents).

### 3. Handles Non-Existent User
Tests that service returns `success: false` with appropriate error message when user doesn't exist.

### 4. Creates Tenant If Not Exists
Tests automatic tenant creation for users without existing portal tenant.

### 5. Attaches All Active Agents When Null
Tests that `agentNames: null` attaches all active agents from `portal_available_agents`.

### Running Tests
```bash
php artisan test --filter=AgentAttachmentServiceTest
```

Expected output:
```
✓ it attaches purchased agents to user via service
✓ it only attaches specified agents via service  
✓ it handles non-existent user gracefully
✓ it creates tenant if not exists
✓ it attaches all active agents when no agent names provided

Tests: 5 passed (25 assertions)
```

## Usage Examples

### Payment Controller (Synchronous)
```php
use App\Services\AgentAttachmentService;

$service = app(AgentAttachmentService::class);
$result = $service->attachAgentsToUser($user->email, $purchasedAgents);

if ($result['success']) {
    // Success! User has immediate access to agents
    return response()->json([
        'success' => true,
        'agents_attached' => $result['agents_attached'],
        'tenant_id' => $result['tenant_id'],
    ]);
}
```

### Artisan Command (Async Job)
```php
use App\Jobs\AttachPortalAgentsToUser;

// For CLI operations, use job wrapper for progress tracking
AttachPortalAgentsToUser::dispatch(
    $email,
    ['Sales Agent', 'Support Agent']
);
```

### Direct Service Call
```php
use App\Services\AgentAttachmentService;

$service = new AgentAttachmentService();

// Attach specific agents
$result = $service->attachAgentsToUser(
    'user@example.com',
    ['Sales Agent'],
    'Acme Corp',
    'acme'
);

// Attach all active agents
$result = $service->attachAgentsToUser(
    'user@example.com',
    null,  // null = all active
    'Acme Corp'
);
```

## Troubleshooting

### User Gets Payment Success But No Agents

**Check Logs:**
```bash
tail -f storage/logs/laravel.log | grep "attach"
```

**Look for:**
- "Successfully attached agents" (success)
- "Failed to attach agents" (error with message)

**Common Issues:**
1. User not found in database
2. Agent names from cart don't match `portal_available_agents.name`
3. Database transaction rollback due to constraint violation

### Agents Not Appearing in Portal

**Verify agent_access records:**
```php
$tenant = PortalTenant::where('user_id', $user->id)->first();
$access = AgentAccess::where('tenant_id', $tenant->id)
    ->where('is_active', true)
    ->get();
```

**Check subscription status:**
```php
$subscription = CustomerSubscription::where('tenant_id', $tenant->id)
    ->where('status', 'active')
    ->first();
```

### Test Service Directly
```php
php artisan tinker

$service = app(App\Services\AgentAttachmentService::class);
$result = $service->attachAgentsToUser('test@example.com', ['Sales Agent']);
dd($result);
```

## Key Features

### ✅ Selective Agent Attachment
Only attaches agents that were actually purchased (not all available agents).

### ✅ Transaction Safety
All database operations wrapped in transaction - rolls back automatically on error.

### ✅ Idempotent
Running multiple times doesn't create duplicate agent access records.

### ✅ Immediate Access
Synchronous execution means users get instant access after payment.

### ✅ Proper Error Handling
Returns structured result with success status and error messages.

### ✅ Comprehensive Logging
All operations logged for debugging and audit trail.

### ✅ Flexible Architecture
Service can be called directly (sync) or via job wrapper (async).

## Future Improvements

1. **Email Notifications**: Send confirmation email when agents are attached
2. **Webhook Support**: Trigger webhooks for external integrations
3. **Agent Quotas**: Track and enforce usage limits per agent
4. **Billing Integration**: Link to subscription billing cycle
5. **Agent Versioning**: Handle different versions of agents
6. **Bulk Operations**: CLI command to attach agents to multiple users
