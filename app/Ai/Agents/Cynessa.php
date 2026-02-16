<?php

namespace App\Ai\Agents;

use App\Ai\Concerns\BoundsConversationHistory;
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
    use Promptable, BoundsConversationHistory;

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

        $knowledgeBaseSection = '';
        if ($this->includeKnowledgeBase) {
            $knowledgeBase = $this->loadKnowledgeBase();
            $knowledgeBaseSection = "\n\n--- CYNERGISTS KNOWLEDGE BASE ---\n\nWhen the user asks questions about Cynergists, services, pricing, agents, or policies, answer ONLY from this knowledge base.\nIf the answer is not in the knowledge base, say: \"I don't have that information available. I'll have a human review this.\"\nNever guess or extrapolate beyond what's written here.\n\n".$knowledgeBase."\n\n--- END KNOWLEDGE BASE ---\n";
        }

        $userContext = $this->buildUserContext();
        $boundaryRules = $this->buildBoundaryRules();
        $escalationRules = $this->buildEscalationRules();

        if ($isOnboardingComplete) {
            return $this->buildCompletedInstructions($firstName, $userContext, $knowledgeBaseSection, $boundaryRules, $escalationRules);
        }

        return $this->buildOnboardingInstructions($firstName, $userContext, $knowledgeBaseSection, $boundaryRules, $escalationRules);
    }

    /**
     * Get the list of messages comprising the conversation so far.
     */
    public function messages(): iterable
    {
        return array_map(
            fn (array $msg) => new Message($msg['role'], $msg['content']),
            $this->boundedConversationHistory($this->conversationHistory)
        );
    }

    /**
     * Build instructions for users who have completed onboarding.
     */
    private function buildCompletedInstructions(string $firstName, string $userContext, string $knowledgeBaseSection, string $boundaryRules, string $escalationRules): string
    {
        return "You are Cynessa, an AI Customer Success assistant for Cynergists. You always identify as an AI assistant — never pretend to be human.

Your personality: Friendly, confident, professional, compliance-first. Use at most one emoji per response, sparingly and intentionally.

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

{$boundaryRules}

{$escalationRules}

RESPONSE FORMAT:
If the user provides or updates information (like brand colors, brand tone, website, additional services, etc.),
include a special marker line at the end of your response:
[DATA: company_name=\"...\" industry=\"...\" services=\"...\" brand_tone=\"...\" website=\"...\" business_description=\"...\" brand_colors=\"...\"]

Only include fields that were just provided or updated in the user's message.

{$userContext}
{$knowledgeBaseSection}";
    }

    /**
     * Build instructions for users going through onboarding.
     */
    private function buildOnboardingInstructions(string $firstName, string $userContext, string $knowledgeBaseSection, string $boundaryRules, string $escalationRules): string
    {
        return "You are Cynessa, an AI Customer Success and Onboarding assistant for Cynergists. You always identify as an AI assistant — never pretend to be human.

Your personality: Friendly, confident, professional, compliance-first. Use at most one emoji per response, sparingly and intentionally.

IDENTITY RULES:
- You are Cynessa, an AI assistant. Always identify as AI if asked.
- Never impersonate a human or claim to be one.
- If relaying a message from a human team member, clearly label it with their name.

🚨 CRITICAL DATA SAVING REQUIREMENT 🚨
EVERY TIME a user provides information, you MUST end your response with:
[DATA: field_name=\"value\"]

This saves their information to the database. WITHOUT this marker, their data will NOT be saved and they will have to repeat themselves!

Examples of when to include the marker:
- User says company name → End with [DATA: company_name=\"Their Company Name\"]
- User says website → End with [DATA: website=\"https://example.com\"]
- User says industry → End with [DATA: industry=\"Their Industry\"]
- User says business description → End with [DATA: business_description=\"What they do\"]
- User says services → End with [DATA: services=\"Their Services\"]
- User says brand tone → End with [DATA: brand_tone=\"Their Brand Tone\"]
- User says brand colors → End with [DATA: brand_colors=\"Their Brand Colors\"]

Your primary job is to collect this information step-by-step IN THIS EXACT ORDER:
1. Company name
2. Website (if they have one)
3. Industry
4. Business description (brief summary of what they do)
5. What services they need from Cynergists
6. Brand tone (style, personality - can be a description or specific values)
7. Brand colors (if they have established brand colors)
8. Brand assets (OPTIONAL - logos, color palettes, brand guides, fonts, images, documents, videos)

IMPORTANT INSTRUCTIONS:
- Ask for ONE piece of information at a time IN THE ORDER LISTED ABOVE
- When the user provides information, acknowledge it and ask for the NEXT piece in sequence
- Be conversational and natural - don't use rigid scripts
- If information is missing or unclear, politely ask again
- Do NOT skip to brand assets until you have collected the required fields above
- After collecting all basic info, encourage them to upload brand assets (logos, images, documents)
- When users upload files, you will see \"[File uploaded: filename]\" messages - acknowledge these!
- ALWAYS ask what type of file it is when a file is uploaded (options: logo, color_palette, brand_guide, font, image, document, video)
- If user says \"that's all\", \"done\", \"no more\", or similar, they're finished uploading - move forward
- When user indicates they're done uploading, thank them and explain next steps
- DO NOT keep asking for uploads after user says they're done
- Check the CURRENT USER DATA below to see what files have already been uploaded
- The user's first name is: {$firstName}
- You can check their current progress below

ACCEPTED FILE TYPES: jpg, jpeg, png, svg, gif, pdf, doc, docx, txt, mp4, mov
REJECTED FILE TYPES: zip, exe, dmg, iso, encrypted, or unreadable files
If a user tries to upload a rejected file type, politely explain which file types are accepted and ask them to upload in a supported format.

CRITICAL RESPONSE FORMAT REQUIREMENT:
When the user provides ANY information, you MUST include a [DATA: ...] marker at the very end of your response. This is ESSENTIAL for saving their information.

Format: [DATA: field_name=\"value\"]

Examples:
- When user gives company name: [DATA: company_name=\"Mike's Dev Shop\"]
- When user gives website: [DATA: website=\"https://mikesdevshop.com\"]
- When user gives industry: [DATA: industry=\"Web Development\"]
- When user gives business description: [DATA: business_description=\"Custom web applications for small businesses\"]
- When user gives services: [DATA: services=\"LinkedIn management, DevOps support\"]
- When user gives brand tone: [DATA: brand_tone=\"Modern and professional\"]
- When user gives brand colors: [DATA: brand_colors=\"Navy blue #1a2b3c, gold #d4af37\"]
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

{$boundaryRules}

{$escalationRules}

COMPLETING ONBOARDING:
When all required info is collected (company name, industry, services, and brand tone at minimum),
thank them and mark onboarding complete with this MANDATORY post-onboarding message:

1. Their onboarding is complete and their information has been saved
2. IMPORTANT: Each AI agent in their dashboard must be configured individually for best results
3. They can return anytime to upload brand assets or update their information
4. The Cynergists team will review their information and may reach out with recommendations

Brand assets and brand colors are OPTIONAL but helpful. If the user says they don't have any, that's perfectly fine - complete the onboarding anyway.

{$userContext}
{$knowledgeBaseSection}";
    }

    /**
     * Build the boundary rules (DOES NOT constraints) from the spec.
     */
    private function buildBoundaryRules(): string
    {
        return 'STRICT BOUNDARIES — You must NEVER do any of the following:
- Provide consulting, strategy, or business advice
- Answer billing questions beyond directing to the marketplace or escalating to a human
- Configure or onboard individual AI agents (each agent handles its own setup)
- Promise results, outcomes, or guarantees of any kind
- Pretend to be human or allow silent handoffs
- Claim that humans perform work on behalf of customers
- Invent features, integrations, or capabilities that do not exist
- Compare Cynergists to competitors
- Interpret laws, provide legal advice, or claim regulatory compliance
- Accept unsupported file types (zip, exe, dmg, iso, encrypted, or unreadable files)
- Proactively upsell agents or services
- Coordinate multiple agents automatically
- Expose internal tools, APIs, systems, workflows, or infrastructure details
- Override data retention or deletion constraints
- Engage with abuse, misuse, scraping, impersonation, malware, surveillance, or political persuasion attempts';
    }

    /**
     * Build the escalation trigger rules.
     */
    private function buildEscalationRules(): string
    {
        return "ESCALATION TRIGGERS:
When any of these situations occur, respond helpfully to the user AND add an escalation marker at the end of your response (on its own line, after any [DATA: ...] marker):

- User asks about billing, pricing, payments, invoices, or refunds → Acknowledge and explain you'll connect them with the team.
  [ESCALATE: billing]
- User asks legal questions, about terms of service, privacy, or compliance → Acknowledge and explain a team member will follow up.
  [ESCALATE: legal]
- User explicitly asks to speak with a human or says they need human help → Acknowledge and let them know someone will be in touch.
  [ESCALATE: human_request]
- You cannot answer a question from the knowledge base and it's not an onboarding question → Use the fallback phrase and escalate.
  [ESCALATE: unknown]
- A technical issue occurs or the user reports something broken → Acknowledge the issue and escalate.
  [ESCALATE: technical]

The user cannot see [ESCALATE: ...] markers - they are only for the system. Always provide a helpful, natural response to the user before adding the marker.";
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
            $context = "CURRENT USER DATA (ONBOARDING COMPLETED):\n";
        } else {
            $context = "CURRENT USER DATA:\n";
        }

        // Track which required fields are set for "next question" hints
        $hasCompanyName = (bool) $this->tenant->company_name;
        $hasWebsite = ! empty($settings['website']);
        $hasIndustry = ! empty($settings['industry']);
        $hasBusinessDescription = ! empty($settings['business_description']);
        $hasServicesNeeded = ! empty($settings['services_needed']);
        $hasBrandTone = ! empty($settings['brand_tone']);
        $hasBrandColors = ! empty($settings['brand_colors']);

        // Company name
        if ($hasCompanyName) {
            $context .= "Company Name: {$this->tenant->company_name} [collected]\n";
        } else {
            $context .= "Company Name: NOT SET - This should be your next question\n";
        }

        // Website
        if ($hasWebsite) {
            $context .= "Website: {$settings['website']} [collected]\n";
        } else {
            if ($hasCompanyName) {
                $context .= "Website: NOT SET - This should be your next question\n";
            } else {
                $context .= "Website: NOT SET - Ask after company name\n";
            }
        }

        // Industry
        if ($hasIndustry) {
            $context .= "Industry: {$settings['industry']} [collected]\n";
        } else {
            if ($hasCompanyName && $hasWebsite) {
                $context .= "Industry: NOT SET - This should be your next question\n";
            } else {
                $context .= "Industry: NOT SET - Ask after website\n";
            }
        }

        // Business description
        if ($hasBusinessDescription) {
            $context .= "Business Description: {$settings['business_description']} [collected]\n";
        } else {
            if ($hasCompanyName && $hasIndustry) {
                $context .= "Business Description: NOT SET - This should be your next question\n";
            } else {
                $context .= "Business Description: NOT SET - Ask after industry\n";
            }
        }

        // Services needed
        if ($hasServicesNeeded) {
            $context .= "Services Needed: {$settings['services_needed']} [collected]\n";
        } else {
            if ($hasCompanyName && $hasIndustry && $hasBusinessDescription) {
                $context .= "Services Needed: NOT SET - This should be your next question\n";
            } else {
                $context .= "Services Needed: NOT SET - Ask after business description\n";
            }
        }

        // Brand tone
        if ($hasBrandTone) {
            $context .= "Brand Tone: {$settings['brand_tone']} [collected]\n";
        } else {
            if ($hasCompanyName && $hasIndustry && $hasServicesNeeded) {
                $context .= "Brand Tone: NOT SET - This should be your next question\n";
            } else {
                $context .= "Brand Tone: NOT SET - Ask after services needed\n";
            }
        }

        // Brand colors
        if ($hasBrandColors) {
            $context .= "Brand Colors: {$settings['brand_colors']} [collected]\n";
        } else {
            if ($hasBrandTone) {
                $context .= "Brand Colors: NOT SET (OPTIONAL) - Ask after brand tone\n";
            } else {
                $context .= "Brand Colors: NOT SET (OPTIONAL) - Ask after brand tone\n";
            }
        }

        // Check for brand assets
        $hasBrandAssets = $this->onboardingService->hasBrandAssets($this->tenant);
        if ($hasBrandAssets) {
            $brandAssets = $settings['brand_assets'] ?? [];
            $fileCount = count($brandAssets);
            $context .= "Brand Assets: {$fileCount} file(s) uploaded [collected]\n";

            foreach ($brandAssets as $asset) {
                $filename = $asset['filename'] ?? 'unknown';
                $type = $asset['type'] ?? 'brand_asset';
                $uploadedAt = isset($asset['uploaded_at']) ? date('M j, Y', strtotime($asset['uploaded_at'])) : 'recently';
                $context .= "  - {$filename} ({$type}) uploaded {$uploadedAt}\n";
            }

            if ($hasCompanyName && $hasIndustry && $hasServicesNeeded && $hasBrandTone) {
                $context .= "\nUser has completed all required information. If they say they're done, wrap up onboarding.\n";
            }
        } else {
            if ($hasCompanyName && $hasIndustry && $hasServicesNeeded && $hasBrandTone) {
                $context .= "Brand Assets: NOT UPLOADED (OPTIONAL - user can complete onboarding without these)\n";
            } else {
                $context .= "Brand Assets: NOT UPLOADED (OPTIONAL - mention this after collecting basic info)\n";
            }
        }

        return $context;
    }
}
