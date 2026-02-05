<?php

namespace App\Services\Cynessa;

use App\Models\PortalAvailableAgent;
use App\Models\PortalTenant;
use App\Models\User;
use App\Services\ClaudeService;

class CynessaAgentHandler
{
    public function __construct(
        private ClaudeService $claudeService,
        private OnboardingService $onboardingService
    ) {}

    /**
     * Handle an incoming chat message and generate a response.
     */
    public function handle(string $message, User $user, PortalAvailableAgent $agent, PortalTenant $tenant, array $conversationHistory = [], int $maxTokens = 1024): string
    {
        // Check if user wants to restart onboarding
        if ($this->isOnboardingRestartRequest($message)) {
            $this->onboardingService->resetOnboarding($tenant);
            $tenant->refresh(); // Reload to get fresh state
        }

        // Build context about the user and their current onboarding state
        $settings = $tenant->settings ?? [];

        // Check if this is a question about Cynergists - if so, include knowledge base
        $includeKnowledgeBase = $this->isQuestionAboutCynergists($message);

        $systemPrompt = $this->buildSystemPrompt($user, $tenant, $settings, $includeKnowledgeBase);
        $userContext = $this->buildUserContext($tenant, $settings);

        // Build messages array for Claude API
        $messages = [];

        // Add conversation history (excluding the current message which is already passed in)
        foreach ($conversationHistory as $msg) {
            $messages[] = [
                'role' => $msg['role'],
                'content' => $msg['content'],
            ];
        }

        // Add the current user message with context
        $messages[] = [
            'role' => 'user',
            'content' => $userContext."\n\nUser message: ".$message,
        ];

        try {
            $response = $this->claudeService->chat($messages, $systemPrompt, $maxTokens);

            // Extract any structured data from the response
            $this->extractAndSaveData($response, $tenant);

            // Check if onboarding should be marked complete
            $tenant->refresh(); // Reload to get updated data
            if (! $this->onboardingService->isComplete($tenant)) {
                // Check if all requirements are now met
                $settings = $tenant->settings ?? [];
                $hasAllData = ! empty($tenant->company_name)
                    && ! empty($settings['industry'])
                    && ! empty($settings['services_needed'])
                    && ! empty($settings['brand_tone'])
                    && $this->onboardingService->hasBrandAssets($tenant);

                if ($hasAllData) {
                    $this->onboardingService->markComplete($tenant);
                }
            }

            // Strip the DATA marker from the response before showing to user
            $cleanResponse = $this->stripDataMarkers($response);

            return $cleanResponse;
        } catch (\Exception $e) {
            \Log::error('Claude API error in Cynessa: '.$e->getMessage());

            return "I'm having trouble connecting right now. Please try again in a moment or contact support if this continues.";
        }
    }

    /**
     * Load the Cynergists knowledge base from database (cached).
     */
    private function loadKnowledgeBase(string $agentName = 'cynessa'): string
    {
        $content = \App\Models\AgentKnowledgeBase::getForAgent($agentName);

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
     * Check if message is asking a question about Cynergists.
     */
    private function isQuestionAboutCynergists(string $message): bool
    {
        $keywords = [
            'what is cynergists',
            'cynergists',
            'how does',
            'how much',
            'pricing',
            'cost',
            'billing',
            'cancel',
            'refund',
            'agent',
            'agents',
            'marketplace',
            'what do you',
            'tell me about',
            'explain',
            'support',
            'help',
            'custom',
            'integration',
        ];

        $lowerMessage = strtolower($message);

        foreach ($keywords as $keyword) {
            if (strpos($lowerMessage, $keyword) !== false) {
                return true;
            }
        }

        return false;
    }

    /**
     * Build the system prompt for Claude.
     */
    private function buildSystemPrompt(User $user, PortalTenant $tenant, array $settings, bool $includeKnowledgeBase = false): string
    {
        $firstName = explode(' ', $user->name)[0] ?? $user->name;
        $isOnboardingComplete = $this->onboardingService->isComplete($tenant);

        $knowledgeBaseSection = '';
        if ($includeKnowledgeBase) {
            $knowledgeBase = $this->loadKnowledgeBase('cynessa');
            $knowledgeBaseSection = "\n\n--- CYNERGISTS KNOWLEDGE BASE ---\n\nWhen the user asks questions about Cynergists, services, pricing, agents, or policies, answer ONLY from this knowledge base.\nIf the answer is not in the knowledge base, say: \"I don't have that information available. I'll have a human review this.\"\nNever guess or extrapolate beyond what's written here.\n\n".$knowledgeBase."\n\n--- END KNOWLEDGE BASE ---\n";
        }

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

You can see their current information in the CURRENT USER DATA section below.".$knowledgeBaseSection;
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
5. Brand assets (logos, colors, fonts, documents)

IMPORTANT INSTRUCTIONS:
- Ask for ONE piece of information at a time IN THE ORDER LISTED ABOVE
- When the user provides information, acknowledge it and ask for the NEXT piece in sequence
- Be conversational and natural - don't use rigid scripts
- If information is missing or unclear, politely ask again
- Do NOT skip to brand assets until you have collected: company name, industry, services, AND brand tone
- After collecting all basic info including brand tone, encourage them to upload brand assets (logos, images, documents)
- When users upload files, you will see \"[File uploaded: filename]\" messages - acknowledge these!- ALWAYS ask what type of file it is when a file is uploaded (options: logo, color_palette, brand_guide, font, image, document, video)- If user says \"that's all\", \"done\", \"no more\", or similar, they're finished uploading - move forward
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
When all required info is collected (company name, industry, services, and at least one brand asset file), 
and the user indicates they're done, thank them and let them know:
1. Their onboarding is complete
2. They can now explore their AI agents
3. Each agent should be configured individually for best results".$knowledgeBaseSection;
    }

    /**
     * Build context about the user's current state.
     */
    private function buildUserContext(PortalTenant $tenant, array $settings): string
    {
        $isComplete = $this->onboardingService->isComplete($tenant);

        if ($isComplete) {
            $context = "CURRENT USER DATA (ONBOARDING COMPLETED ✅):\n";
        } else {
            $context = "CURRENT USER DATA:\n";
        }

        if ($tenant->company_name) {
            $context .= "✅ Company Name: {$tenant->company_name}\n";
        } else {
            $context .= "❌ Company Name: NOT SET - This should be your next question\n";
        }

        if (! empty($settings['industry'])) {
            $context .= "✅ Industry: {$settings['industry']}\n";
        } else {
            if ($tenant->company_name) {
                $context .= "❌ Industry: NOT SET - This should be your next question\n";
            } else {
                $context .= "❌ Industry: NOT SET - Ask after company name\n";
            }
        }

        if (! empty($settings['services_needed'])) {
            $context .= "✅ Services Needed: {$settings['services_needed']}\n";
        } else {
            if ($tenant->company_name && ! empty($settings['industry'])) {
                $context .= "❌ Services Needed: NOT SET - This should be your next question\n";
            } else {
                $context .= "❌ Services Needed: NOT SET - Ask after industry\n";
            }
        }

        if (! empty($settings['brand_tone'])) {
            $context .= "✅ Brand Tone: {$settings['brand_tone']}\n";
        } else {
            if ($tenant->company_name && ! empty($settings['industry']) && ! empty($settings['services_needed'])) {
                $context .= "❌ Brand Tone: NOT SET - This should be your next question\n";
            } else {
                $context .= "❌ Brand Tone: NOT SET - Ask after services needed\n";
            }
        }

        // Check for brand assets
        $hasBrandAssets = $this->onboardingService->hasBrandAssets($tenant);
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
            if ($tenant->company_name && ! empty($settings['industry']) && ! empty($settings['services_needed']) && ! empty($settings['brand_tone'])) {
                $context .= "\n💡 User has completed all required information. If they say they're done, wrap up onboarding.\n";
            }
        } else {
            if ($tenant->company_name && ! empty($settings['industry']) && ! empty($settings['services_needed']) && ! empty($settings['brand_tone'])) {
                $context .= "❌ Brand Assets: NOT UPLOADED - Encourage them to upload brand assets (logos, images, etc.)\n";
            } else {
                $context .= "❌ Brand Assets: NOT UPLOADED - Mention this after collecting basic info including brand tone\n";
            }
        }

        return $context;
    }

    /**
     * Extract structured data from Claude's response and save it.
     */
    private function extractAndSaveData(string $response, PortalTenant $tenant): void
    {
        // Look for [DATA: ...] marker
        if (preg_match('/\[DATA: (.*?)\]/', $response, $matches)) {
            $dataString = $matches[1];

            // Parse the data string
            $updates = [];

            if (preg_match('/company_name="([^"]+)"/', $dataString, $match)) {
                $updates['company_name'] = trim($match[1]);
            }

            if (preg_match('/industry="([^"]+)"/', $dataString, $match)) {
                $updates['industry'] = trim($match[1]);
            }

            if (preg_match('/services="([^"]+)"/', $dataString, $match)) {
                $updates['services_needed'] = trim($match[1]);
            }

            if (preg_match('/brand_tone="([^"]+)"/', $dataString, $match)) {
                $updates['brand_tone'] = trim($match[1]);
            }

            // Check for file type updates
            if (preg_match('/file_type="([^"]+):([^"]+)"/', $dataString, $match)) {
                $filename = trim($match[1]);
                $fileType = trim($match[2]);
                $this->onboardingService->updateBrandAssetType($tenant, $filename, $fileType);
            }

            // Save company info if we have updates
            if (! empty($updates)) {
                $this->onboardingService->updateCompanyInfo($tenant, $updates);
            }
        }
    }

    /**
     * Remove [DATA: ...] markers from the response.
     */
    private function stripDataMarkers(string $response): string
    {
        // Remove all [DATA: ...] markers from the response
        $cleaned = preg_replace('/\[DATA:.*?\]/s', '', $response);

        // Clean up multiple blank lines (more than 2 consecutive newlines)
        $cleaned = preg_replace('/\n{3,}/', "\n\n", $cleaned);

        // Trim any extra whitespace from start and end
        return trim($cleaned);
    }

    /**
     * Check if the message is a request to restart onboarding.
     */
    private function isOnboardingRestartRequest(string $message): bool
    {
        $keywords = [
            'start onboarding',
            'start on boarding',
            'restart onboarding',
            'restart on boarding',
            're-start onboarding',
            'begin onboarding',
            'begin on boarding',
            'redo onboarding',
            'redo on boarding',
            'onboard me',
            'onboard again',
            'start over',
            'restart setup',
            'restart the onboarding',
            'reset onboarding',
            'reset on boarding',
        ];

        $lowerMessage = strtolower($message);

        foreach ($keywords as $keyword) {
            if (strpos($lowerMessage, $keyword) !== false) {
                return true;
            }
        }

        return false;
    }
}
