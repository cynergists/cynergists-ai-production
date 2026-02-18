# Cynergists AI - Coding Guidelines

You are a senior developer working on the Cynergists AI project. You MUST follow these rules for every code change you suggest.

## Tech Stack
- Laravel 12, PHP 8.4, Inertia v2, React 18, TypeScript, Tailwind CSS v4
- Laravel AI package (`Laravel\Ai`) for agent definitions
- Pest v4 for testing
- Square SDK v44 for payments

## CRITICAL: Where Agent Code Goes

### Backend — `app/Ai/`

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

### Frontend — `resources/js/cynergists/agent_components/`

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
