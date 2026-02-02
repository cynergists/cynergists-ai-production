# Agent Purchase & Attachment System

## Overview
When a user purchases AI agents through the checkout process, the system automatically attaches those agents to their portal tenant, giving them immediate access to use the purchased agents.

## Flow

### 1. **User Adds Agents to Cart**
- Users browse available agents in the marketplace
- Click "Add to Cart" to add agents with monthly or annual billing
- Cart items include agent name, price, and billing period

### 2. **Checkout Process**
- User proceeds to checkout at `/checkout`
- If not logged in, user can:
  - Enter email to check if account exists
  - Login (if existing user)
  - Register new account (if new user)
- Complete payment using Square (production) or test card (sandbox)

### 3. **Payment Processing** 
File: `app/Http/Controllers/Api/PaymentController.php`

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

// 4. Dispatch job to attach agents
AttachPortalAgentsToUser::dispatch(
    $user->email,
    companyName: null,
    subdomain: null,
    agentNames: $purchasedAgentNames
);
```

### 4. **Agent Attachment Job**
File: `app/Jobs/AttachPortalAgentsToUser.php`

The job runs asynchronously and:

1. **Finds or Creates User's Portal Tenant**
   - Looks for existing tenant for the user
   - Creates new tenant if none exists
   - Sets up company name and subdomain

2. **Creates or Finds Subscription**
   - Links tenant to a customer subscription
   - Sets subscription status to 'active'

3. **Attaches Purchased Agents**
   - Queries `portal_available_agents` table for matching agent names
   - Creates `agent_access` records for each agent
   - Links agents to the tenant and subscription

4. **Configuration**
   ```php
   AgentAccess::create([
       'id' => (string) Str::uuid(),
       'subscription_id' => $subscription->id,
       'customer_id' => $tenant->id,
       'agent_type' => $available->category,
       'agent_name' => $available->name,
       'configuration' => [],
       'is_active' => true,
       'tenant_id' => $tenant->id,
   ]);
   ```

### 5. **User Access**
Once attached, users can:
- View their agents in the portal dashboard
- Start conversations with purchased agents
- Configure agent settings
- Monitor usage and limits

## Key Components

### Database Tables

**`portal_available_agents`**
- Master list of all available agents
- Contains: name, description, price, features, etc.
- Defines which agents can be purchased

**`agent_access`**  
- Links users/tenants to specific agents
- Contains: subscription_id, tenant_id, agent_name, configuration
- Determines which agents a user can access

**`portal_tenants`**
- User's portal workspace
- Contains: user_id, company_name, subdomain, settings
- Each user has one tenant

**`customer_subscriptions`**
- Subscription record linking tenant to purchased services
- Contains: tier, start_date, end_date, status

### API Endpoints

**POST `/api/payment/process`**
- Processes Square payment
- Validates payment data
- Dispatches agent attachment job
- Returns payment confirmation

**POST `/api/checkout/register`**
- Creates new user account during checkout
- Creates profile and assigns 'client' role
- Sets up portal tenant automatically

**POST `/api/checkout/check-email`**
- Checks if email already exists
- Helps determine login vs registration flow

## Testing

Run the test suite:
```bash
php artisan test --filter=AgentPurchaseAttachmentTest
```

### Test Coverage
- ✅ Dispatches attachment job after successful payment
- ✅ Attaches only purchased agents (not all agents)
- ✅ Creates tenant if user doesn't have one
- ✅ Falls back to attaching all agents when none specified
- ✅ Handles existing agent access gracefully

## Manual Testing

### Sandbox Mode (Development)
1. Add agents to cart on the site
2. Go to checkout
3. Use test card:
   - Number: `4111 1111 1111 1111`
   - CVV: `111`
   - Expiry: any future date
4. Complete payment
5. Check Laravel logs: `tail -f storage/logs/laravel.log`
6. Verify job was dispatched and agents were attached

### Production Mode
1. Ensure `SQUARE_ENVIRONMENT=production` in `.env`
2. Use real credit card for payment
3. Monitor payment processing in Square dashboard
4. Verify agents appear in user's portal

## Troubleshooting

### Job Not Dispatched
**Symptom**: Payment succeeds but agents not attached

**Check:**
1. User exists with matching email
2. Cart items contain agent names
3. Queue is running: `php artisan queue:work`
4. Check logs for "Dispatched agent attachment job" message

### Agents Not Appearing
**Symptom**: Job runs but agents don't show in portal

**Check:**
1. Agent names match exactly (case-sensitive)
2. Agents are marked `is_active = true` in `portal_available_agents`
3. Tenant exists for user
4. Check `agent_access` table for created records

### Duplicate Agents
**Symptom**: Same agent attached multiple times

**Note**: The job updates existing `agent_access` records if they already exist, so duplicates shouldn't occur. If they do:
1. Check for multiple tenants per user
2. Review job logic for upsert behavior

## Command Line Tools

### Manually Attach Agents
```bash
# Attach all active agents to a user
php artisan portal:attach-agents user@example.com

# Attach with specific company and subdomain
php artisan portal:attach-agents user@example.com \
  --company="Acme Corp" \
  --subdomain="acme"
```

### Check Agent Access
```bash
php artisan tinker
> $user = User::where('email', 'user@example.com')->first();
> $tenant = PortalTenant::forUser($user);
> AgentAccess::where('tenant_id', $tenant->id)->get();
```

## Future Enhancements

### Potential Improvements
1. **Subscription Tiers**: Different agent access based on plan level
2. **Usage Limits**: Track and enforce usage limits per agent
3. **Trial Periods**: Temporary agent access before purchase
4. **Agent Upgrades**: Allow upgrading from basic to premium versions
5. **Bulk Purchases**: Discount codes for multiple agents
6. **Gifting**: Purchase agents for other users
7. **Webhooks**: Notify external systems on agent purchase

## Related Files
- `app/Http/Controllers/Api/PaymentController.php` - Payment processing
- `app/Http/Controllers/Api/CheckoutController.php` - Registration/email check
- `app/Jobs/AttachPortalAgentsToUser.php` - Agent attachment logic
- `app/Models/AgentAccess.php` - Agent access model
- `app/Models/PortalAvailableAgent.php` - Available agents model
- `app/Models/PortalTenant.php` - Tenant model
- `resources/js/cynergists/pages/Checkout.tsx` - Frontend checkout
- `tests/Feature/AgentPurchaseAttachmentTest.php` - Test suite
