<?php

namespace App\Ai\Agents;

use App\Models\PortalTenant;
use App\Models\User;
use App\Services\Cynessa\OnboardingService;
use Laravel\Ai\Attributes\MaxTokens;
use Laravel\Ai\Attributes\Provider;
use Laravel\Ai\Attributes\Temperature;
use Laravel\Ai\Attributes\Timeout;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\Conversational;
use Laravel\Ai\Messages\Message;
use Laravel\Ai\Promptable;
use Stringable;

#[Provider('anthropic')]
#[MaxTokens(1024)]
#[Temperature(0.7)]
#[Timeout(120)]
class Cynessa implements Agent, Conversational
{
    use Promptable;

    private OnboardingService $onboardingService;

    public function __construct(
        public User $user,
        public PortalTenant $tenant,
        public array $conversationHistory = [],
        public bool $includeKnowledgeBase = false
    ) {
        $this->onboardingService = app(OnboardingService::class);
    }

    /**
     * Get the instructions that the agent should follow.
     */
    public function instructions(): Stringable|string
    {
        $firstName = explode(' ', $this->user->name)[0] ?? $this->user->name;
        $isOnboardingComplete = $this->onboardingService->isComplete($this->tenant);
        $settings = $this->tenant->settings ?? [];

        $knowledgeBaseSection = '';
        if ($this->includeKnowledgeBase) {
            $knowledgeBase = $this->loadKnowledgeBase();
            $knowledgeBaseSection = "\n\n--- CYNERGISTS KNOWLEDGE BASE ---\n\nWhen the user asks questions about Cynergists, services, pricing, agents, or policies, answer ONLY from this knowledge base.\nIf the answer is not in the knowledge base, say: \"I don't have that information available. I'll have a human review this.\"\nNever guess or extrapolate beyond what's written here.\n\n".$knowledgeBase."\n\n--- END KNOWLEDGE BASE ---\n";
        }

        // Build user context
        $userContext = $this->buildUserContext();

        // Different behavior for completed vs incomplete onboarding
        if ($isOnboardingComplete) {
            return "You are Cynessa, an AI assistant for Cynergists. You help customers who have already completed their onboarding.

Your personality: Friendly, professional, helpful, concise. Use emojis sparingly but appropriately.

IMPORTANT: The user {$firstName} has already completed onboarding and provided all required information (company details, services needed, and brand assets).

Your role now is to:
- Answer questions about Cynergists, their services, and the platform
- Help them understand how to use their AI agents
- Provide guidance on next steps and best practices
- Direct them to support if needed

DO NOT:
- Ask for company name, industry, or services again
- Request brand assets again
- Act like they're a new user

RESPONSE FORMAT:
If the user provides or updates information (like brand colors, brand tone, additional services, etc.),
include a special marker line at the end of your response:
[DATA: company_name=\"...\" industry=\"...\" services=\"...\" brand_tone=\"...\"]

Only include fields that were just provided or updated in the user's message.

{$userContext}
{$knowledgeBaseSection}";
        }

        return "You are Cynessa, an AI onboarding assistant for Cynergists. You help new customers get set up by collecting key information.

Your personality: Friendly, professional, helpful, concise. Use emojis sparingly but appropriately.

🚨 CRITICAL DATA SAVING REQUIREMENT 🚨
EVERY TIME a user provides information, you MUST end your response with:
[DATA: field_name=\"value\"]

This saves their information to the database. WITHOUT this marker, their data will NOT be saved and they will have to repeat themselves!

Examples of when to include the marker:
- User says company name → End with [DATA: company_name=\"Their Company Name\"]
- User says industry → End with [DATA: industry=\"Their Industry\"]
- User says services → End with [DATA: services=\"Their Services\"]
- User says brand tone → End with [DATA: brand_tone=\"Their Brand Tone\"]

Your primary job is to collect this information step-by-step IN THIS EXACT ORDER:
1. Company name
2. Industry
3. What services they need from Cynergists
4. Brand tone (colors, style, personality - can be a description or specific values)
5. Brand assets (OPTIONAL - logos, colors, fonts, documents)

IMPORTANT INSTRUCTIONS:
- Ask for ONE piece of information at a time IN THE ORDER LISTED ABOVE
- When the user provides information, acknowledge it and ask for the NEXT piece in sequence
- Be conversational and natural - don't use rigid scripts
- If information is missing or unclear, politely ask again
- Do NOT skip to brand assets until you have collected: company name, industry, services, AND brand tone
- After collecting all basic info including brand tone, encourage them to upload brand assets (logos, images, documents)
- When users upload files, you will see \"[File uploaded: filename]\" messages - acknowledge these!
- ALWAYS ask what type of file it is when a file is uploaded (options: logo, color_palette, brand_guide, font, image, document, video)
- If user says \"that's all\", \"done\", \"no more\", or similar, they're finished uploading - move forward
- When user indicates they're done uploading, thank them and explain next steps
- DO NOT keep asking for uploads after user says they're done
- Check the CURRENT USER DATA below to see what files have already been uploaded
- Accepted file types: images (jpg, png, svg), PDFs, documents, videos
- The user's first name is: {$firstName}
- You can check their current progress below

CRITICAL RESPONSE FORMAT REQUIREMENT:
When the user provides ANY information (company name, industry, services, brand tone), you MUST include a [DATA: ...] marker at the very end of your response. This is ESSENTIAL for saving their information.

Format: [DATA: field_name=\"value\"]

Examples:
- When user gives company name: [DATA: company_name=\"Mike's Dev Shop\"]
- When user gives industry: [DATA: industry=\"Web Development\"]
- When user gives services: [DATA: services=\"LinkedIn management, DevOps support\"]
- When user gives brand tone: [DATA: brand_tone=\"Modern and professional\"]
- When user gives multiple things: [DATA: company_name=\"Acme Corp\" industry=\"Technology\"]

When user specifies a file type for an uploaded file, use:
[DATA: file_type=\"filename.ext:logo\"]

File type options: logo, color_palette, brand_guide, font, image, document, video

IMPORTANT:
- ALWAYS include the [DATA: ...] marker when information is provided
- Only include fields that were just provided in THIS message
- The marker should be on its own line at the very end

IMPORTANT: Do NOT create summaries or lists that rely on the [DATA: ...] marker to display information.
The user cannot see [DATA: ...] markers - they are only for the system.
When summarizing, write out the actual information in plain text, not in DATA format.

COMPLETING ONBOARDING:
When all required info is collected (company name, industry, services, and brand tone),
thank them and mark onboarding complete. Let them know:
1. Their onboarding is complete
2. They can now explore their AI agents
3. Each agent should be configured individually for best results
4. They can always come back to upload brand assets later if they have them

Brand assets are OPTIONAL but helpful. If the user says they don't have any, that's perfectly fine - complete the onboarding anyway.

{$userContext}
{$knowledgeBaseSection}";
    }

    /**
     * Get the list of messages comprising the conversation so far.
     */
    public function messages(): iterable
    {
        return array_map(
            fn (array $msg) => new Message($msg['role'], $msg['content']),
            $this->conversationHistory
        );
    }

    /**
     * Load the Cynergists knowledge base from database (cached).
     */
    private function loadKnowledgeBase(): string
    {
        $content = \App\Models\AgentKnowledgeBase::getForAgent('cynessa');

        if ($content) {
            return $content;
        }

        // Fallback to file if database entry doesn't exist
        $path = storage_path('app/cynessa-knowledge-base.md');

        if (file_exists($path)) {
            return file_get_contents($path);
        }

        return 'Knowledge base not available.';
    }

    /**
     * Build context about the user's current state.
     */
    private function buildUserContext(): string
    {
        $isComplete = $this->onboardingService->isComplete($this->tenant);
        $settings = $this->tenant->settings ?? [];

        if ($isComplete) {
            $context = "CURRENT USER DATA (ONBOARDING COMPLETED ✅):\n";
        } else {
            $context = "CURRENT USER DATA:\n";
        }

        if ($this->tenant->company_name) {
            $context .= "✅ Company Name: {$this->tenant->company_name}\n";
        } else {
            $context .= "❌ Company Name: NOT SET - This should be your next question\n";
        }

        if (! empty($settings['industry'])) {
            $context .= "✅ Industry: {$settings['industry']}\n";
        } else {
            if ($this->tenant->company_name) {
                $context .= "❌ Industry: NOT SET - This should be your next question\n";
            } else {
                $context .= "❌ Industry: NOT SET - Ask after company name\n";
            }
        }

        if (! empty($settings['services_needed'])) {
            $context .= "✅ Services Needed: {$settings['services_needed']}\n";
        } else {
            if ($this->tenant->company_name && ! empty($settings['industry'])) {
                $context .= "❌ Services Needed: NOT SET - This should be your next question\n";
            } else {
                $context .= "❌ Services Needed: NOT SET - Ask after industry\n";
            }
        }

        if (! empty($settings['brand_tone'])) {
            $context .= "✅ Brand Tone: {$settings['brand_tone']}\n";
        } else {
            if ($this->tenant->company_name && ! empty($settings['industry']) && ! empty($settings['services_needed'])) {
                $context .= "❌ Brand Tone: NOT SET - This should be your next question\n";
            } else {
                $context .= "❌ Brand Tone: NOT SET - Ask after services needed\n";
            }
        }

        // Check for brand assets
        $hasBrandAssets = $this->onboardingService->hasBrandAssets($this->tenant);
        if ($hasBrandAssets) {
            $brandAssets = $settings['brand_assets'] ?? [];
            $fileCount = count($brandAssets);
            $context .= "✅ Brand Assets: {$fileCount} file(s) uploaded\n";

            // List each uploaded file
            foreach ($brandAssets as $asset) {
                $filename = $asset['filename'] ?? 'unknown';
                $type = $asset['type'] ?? 'brand_asset';
                $uploadedAt = isset($asset['uploaded_at']) ? date('M j, Y', strtotime($asset['uploaded_at'])) : 'recently';
                $context .= "  - {$filename} ({$type}) uploaded {$uploadedAt}\n";
            }

            // If they have files, they can finish onboarding
            if ($this->tenant->company_name && ! empty($settings['industry']) && ! empty($settings['services_needed']) && ! empty($settings['brand_tone'])) {
                $context .= "\n💡 User has completed all required information. If they say they're done, wrap up onboarding.\n";
            }
        } else {
            if ($this->tenant->company_name && ! empty($settings['industry']) && ! empty($settings['services_needed']) && ! empty($settings['brand_tone'])) {
                $context .= "⚪ Brand Assets: NOT UPLOADED (OPTIONAL - user can complete onboarding without these)\n";
            } else {
                $context .= "⚪ Brand Assets: NOT UPLOADED (OPTIONAL - mention this after collecting basic info)\n";
            }
        }

        return $context;
    }
}
