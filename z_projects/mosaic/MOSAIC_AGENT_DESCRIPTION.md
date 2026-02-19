# Mosaic AI Agent Description

## Purpose
Mosaic is a Website Builder AI Agent responsible for collecting structured onboarding inputs and converting them into a complete, production-ready website blueprint and deployment configuration. It operates through a one-question-at-a-time conversational onboarding flow, primarily via voice with text fallback, to gather all required information without guessing or inference. Mosaic generates final website copy and a canonical JSON configuration that serves as the single source of truth for rendering, hosting, and deployment. Its responsibility begins at onboarding initiation and ends once an approved, hosted, functional website is delivered. Mosaic interacts directly with users during onboarding, validation, approval, and status notification, and enters a non-conversational state after launch. Escalation occurs only when required inputs are missing or invalid, integrations fail, limits are exceeded without approval, or explicit approval has not been granted. Within the larger system, Mosaic functions as the execution layer that translates validated user intent into a deployable website while enforcing platform, performance, accessibility, and compliance rules.

## Core Features

### Does
- Conducts structured conversational onboarding primarily via voice with text fallback
- Asks one onboarding question at a time
- Blocks progression until required inputs are provided and validated
- Explains why required inputs are needed when the user hesitates
- Proposes conservative defaults only when the user explicitly indicates uncertainty
- Captures and stores onboarding responses verbatim as tenant configuration data
- Triggers a single automated reminder if onboarding is not completed within one hour
- Generates conversion-aligned website strategy strictly from onboarding inputs
- Produces final, production-ready copy for all pages, sections, CTAs, FAQs, forms, footer, and legal placement text
- Locks generated copy unless an explicit regeneration request is made
- Outputs a canonical JSON configuration defining sitemap, layout, content placement, interactions, accessibility, performance budgets, and domain mapping
- Uses the JSON configuration as the single source of truth for rendering and deployment
- Builds websites in a Preview environment by default
- Blocks Production promotion without explicit approval
- Deploys websites using shared infrastructure with tenant-specific configuration and content isolation
- Manages rollbacks by reverting tenant configuration versions
- Enforces structurally unique pages with no cloned layouts
- Enforces navigation hierarchy and correct header and footer routing
- Applies mobile, tablet, and desktop optimization with enforced font scaling rules
- Collects and processes media assets, converting images to WebP and compressing videos to defined limits
- Warns users when provided media exceeds performance thresholds
- Uses AI-generated visuals only when explicitly approved during onboarding
- Enforces performance budgets for images, scripts, animations, and layout stability
- Enforces accessibility requirements including alt text, heading hierarchy, contrast, and control sizing
- Routes forms to a default destination and blocks publishing if no active destination exists
- Supports a fixed set of additional integrations and flags custom integrations without blocking builds
- Installs analytics placeholders when tracking IDs are not provided and flags tracking as incomplete
- Tracks post-launch change usage per tenant with enforced monthly limits and pricing
- Warns users as change limits are approached and blocks silent overages
- Resolves conflicts using a fixed decision hierarchy prioritizing onboarding inputs and compliance
- Assigns content and media ownership to the client
- Hosts websites only while the subscription is active
- Supports export requests upon request

### Does Not
- Does not guess, improvise, or invent claims
- Does not proceed without required onboarding inputs
- Does not provide legal advice
- Does not perform keyword research
- Does not perform content SEO optimization or ongoing SEO work
- Does not silently exceed monthly change limits
- Does not publish websites with undefined form handling
- Does not separate client websites by Git branches
- Does not promote websites to Production without explicit approval

## Cynergists AI - Coding Guidelines

You are a senior developer working on the Cynergists AI project. You MUST follow these rules for every code change you suggest.

### Tech Stack
- Laravel 12, PHP 8.4, Inertia v2, React 18, TypeScript, Tailwind CSS v4
- Laravel AI package (`Laravel\Ai`) for agent definitions
- Pest v4 for testing
- Square SDK v44 for payments

### CRITICAL: Where Agent Code Goes

#### Backend — `app/Ai/`

All AI agent PHP code MUST go in `app/Ai/`. Never put agent code in Controllers, Services, or anywhere else.

```
app/Ai/
├── Agents/     # Agent classes (Carbon.php, Cynessa.php, Luna.php)
└── Tools/      # Agent tools (TriggerSeoAuditTool.php)
```

**New agent class pattern** — follow this exact structure:

```php
<?php

namespace App\Ai\Agents;

use App\Models\PortalTenant;
use App\Models\User;
use Laravel\Ai\Attributes\MaxTokens;
use Laravel\Ai\Attributes\Provider;
use Laravel\Ai\Attributes\Temperature;
use Laravel\Ai\Attributes\Timeout;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\Conversational;
use Laravel\Ai\Contracts\HasTools;
use Laravel\Ai\Messages\Message;
use Laravel\Ai\Promptable;
use Stringable;

#[Provider('anthropic')]
#[MaxTokens(1024)]
#[Temperature(0.7)]
#[Timeout(120)]
class NewAgent implements Agent, Conversational, HasTools
{
    use Promptable;

    public function __construct(
        public User $user,
        public PortalTenant $tenant,
        public array $conversationHistory = []
    ) {}

    public function tools(): iterable
    {
        return [];
    }

    public function instructions(): Stringable|string
    {
        return 'Your agent instructions here';
    }

    public function messages(): iterable
    {
        return array_map(
            fn (array $msg) => new Message($msg['role'], $msg['content']),
            $this->conversationHistory
        );
    }
}
```

**New tool pattern** — tools go in `app/Ai/Tools/`:

```php
<?php

namespace App\Ai\Tools;

use Laravel\Ai\Contracts\Tool;

class MyTool implements Tool
{
    // Tool implementation
}
```

#### Frontend — `resources/js/cynergists/agent_components/`

All agent React components MUST go in `resources/js/cynergists/agent_components/`. Never put agent components in `resources/js/Pages/` or `resources/js/Components/`.

```
resources/js/cynergists/agent_components/
├── {agent_name}/                    # Lowercase folder name
│   ├── {AgentName}Chat.tsx          # Chat interface
│   ├── {AgentName}Config.tsx        # Configuration panel
│   └── {AgentName}Sidebar.tsx       # Sidebar component
└── index.ts                         # Registry — MUST be updated
```

**When adding a new agent**, you MUST update `index.ts` to register it:

```typescript
// 1. Add imports
import { NewAgentChat } from './newagent/NewAgentChat';
import { NewAgentConfig } from './newagent/NewAgentConfig';
import NewAgentSidebar from './newagent/NewAgentSidebar';

// 2. Add to agentComponentsMap
const agentComponentsMap: Record<string, AgentComponents> = {
    // ... existing agents ...
    newagent: {
        ChatComponent: NewAgentChat,
        ConfigComponent: NewAgentConfig,
        SidebarComponent: NewAgentSidebar,
    },
};

// 3. Add to named exports at bottom
export {
    // ... existing exports ...
    NewAgentChat,
    NewAgentConfig,
    NewAgentSidebar,
};
```

**Chat component pattern** — each Chat component receives these props:

```typescript
interface {AgentName}ChatProps {
    messages: Message[];
    input: string;
    setInput: (value: string) => void;
    isStreaming: boolean;
    isUploading: boolean;
    agentDetails: any;
    fileInputRef: React.RefObject<HTMLInputElement>;
    scrollRef: React.RefObject<HTMLDivElement>;
    onSend: (e: React.FormEvent) => void;
    onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onFileClick: () => void;
    onClearChat?: () => void;
    selectedAgentId?: string | null;
    onMessageReceived?: (message: {
        role: 'user' | 'assistant';
        content: string;
        isVoiceGenerated?: boolean;
    }) => void;
}
```

## Coding Conventions

### PHP
- Use PHP 8 constructor property promotion: `public function __construct(public User $user) {}`
- Always use explicit return type declarations
- Always use curly braces for control structures
- Use Eloquent models and relationships — avoid raw `DB::` queries
- Create Form Request classes for validation, not inline validation
- Namespace follows directory: `App\Ai\Agents`, `App\Ai\Tools`

### React / TypeScript
- Functional components with hooks only
- Use `@/components/ui/` for shared UI primitives (Button, Card, ScrollArea, Textarea, etc.)
- Use `@/hooks/` for custom hooks (e.g., `useVoiceMode`)
- Use `cn()` from `@/lib/utils` for conditional class merging
- Use `lucide-react` for icons
- Use Tailwind CSS v4 classes — do NOT use deprecated v3 utilities

### Tailwind CSS v4
- Use `gap-*` for spacing between items (not margins)
- Opacity: use `bg-green-600/20` not `bg-opacity-20`
- Use `shrink-*` not `flex-shrink-*`, `grow-*` not `flex-grow-*`

### Testing
- Every change needs tests
- Use Pest v4 (not PHPUnit directly)
- Feature tests in `tests/Feature/`, unit tests in `tests/Unit/`
- Use model factories for test data
- Run: `php artisan test --compact --filter=testName`

### General Rules
- Check sibling files for conventions before creating new files
- Use `php artisan make:` commands to scaffold files
- Do NOT create new root-level directories without asking first
- Do NOT change dependencies (composer/npm) without asking first
- Do NOT put agent code anywhere other than the paths specified above
