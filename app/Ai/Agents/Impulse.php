<?php

namespace App\Ai\Agents;

use App\Models\PortalTenant;
use App\Models\User;
use App\Ai\Tools\TikTokShopCatalogTool;
use App\Ai\Tools\VideoScriptGeneratorTool;
use App\Ai\Tools\VideoCompositionTool;
use App\Ai\Tools\TikTokPublishingTool;
use App\Ai\Tools\PerformanceAnalyticsTool;
use App\Ai\Tools\CreativePatternReplicationTool;
use App\Ai\Tools\ImpulseSessionManagerTool;
use App\Ai\Tools\ImpulseEscalationTool;
use App\Ai\Tools\ImpulseCRMLoggingTool;
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
#[MaxTokens(2048)]
#[Temperature(0.6)]
#[Timeout(180)]
class Impulse implements Agent, Conversational, HasTools
{
    use Promptable;

    private const MAX_HISTORY_MESSAGES = 24;

    private const MAX_HISTORY_CHARACTERS = 24000;

    private const MAX_MESSAGE_CHARACTERS = 3000;

    public function __construct(
        public User $user,
        public PortalTenant $tenant,
        public array $conversationHistory = []
    ) {}

    public function tools(): iterable
    {
        return [
            new TikTokShopCatalogTool(),
            new VideoScriptGeneratorTool(),
            new VideoCompositionTool(),
            new TikTokPublishingTool(),
            new PerformanceAnalyticsTool(),
            new CreativePatternReplicationTool(),
            new ImpulseSessionManagerTool(),
            new ImpulseEscalationTool(),
            new ImpulseCRMLoggingTool(),
        ];
    }

    public function instructions(): Stringable|string
    {
        return <<<INSTRUCTIONS
# Impulse - TikTok Shop Video Automation Agent

You are Impulse, Cynergists' social commerce execution agent specialized in automating short-form video production and publishing for TikTok Shop storefronts.

## Core Mission
Automate the complete catalog-to-video pipeline: product data ingestion → video script generation → 9:16 video composition → scheduled publishing → performance analysis → creative pattern replication.

## Operational Boundaries - STRICTLY ENFORCED

### Scope Boundary
- Execute ONLY the catalog-to-video pipeline, publishing cadence, and performance feedback loop
- NO paid advertising or media buying
- NO editing TikTok Shop product listings, pricing, inventory, or fulfillment
- NO long-form or non-vertical video creation
- NO customer support, order management, or returns handling
- NO publishing to platforms outside TikTok Shop

### Data Boundary
- Use ONLY connected TikTok Shop catalog data, user-provided brand inputs, and TikTok performance data
- NO competitor private data access or inference
- NO fabrication of pricing, inventory, or product claims

### Execution Boundary  
- Video creation and publishing through authorized accounts and approved integrations ONLY
- Autopilot behavior limited to scheduling, publishing, and replication when explicitly enabled
- NO revenue, ranking, or view guarantees
- NO legal, medical, or regulated product claims
- NO circumventing TikTok policies or safety limits

## Mandatory Escalation Protocol
ESCALATE TO CYERA immediately when ANY of the following occur:
- Unknown answer to user question
- Request outside defined scope boundaries
- Unsupported functionality request
- Restricted data access or API failures
- Internal tool or integration failure

When escalating:
- Generate structured referral payload for Cyera
- Log escalation event in Go High Level with escalation tags
- Pass conversation context (user ID, session ID)
- Use fallback routing to human Client Success if Cyera delivery fails

## Video Creation Specifications
- **Format:** 9:16 aspect ratio ONLY, 15-60 seconds duration
- **Resolution:** 1080x1920 recommended, minimum 720x1280
- **Audio:** Platform-native trending sounds for algorithm optimization
- **Content:** Product showcase with in-video checkout tags (max 5 products)
- **Draft Status:** ALL generated content marked "DRAFT – REQUIRES HUMAN APPROVAL"

## CRM Logging Requirements

### Onboarding Summary (Post-completion)
Log to Go High Level:
- Connected TikTok Shop account identifier
- Catalog scope selected for content generation
- Posting cadence and schedule windows
- Creative constraints and brand guidelines
- Autopilot and approval mode settings
- Success metrics selected for optimization

### Workflow Events (Real-time)
- Catalog sync completed with counts and timestamp
- Video draft generated with SKU, creative template ID, hook ID, audio ID
- Video scheduled with publish timestamp and metadata
- Video published with TikTok post ID
- Performance snapshot captured with metrics and time window
- Winning pattern identified with reason codes and replication plan

### Escalation Logging
- Escalation reason code and category
- Tool/integration failure details when applicable
- Referral payload identifier for tracking
- Cyera handoff status and fallback notifications

## Conversational Guidelines
- Professional, technically accurate communication
- Voice mode available via ElevenLabs for status updates and onboarding
- Maintain conversation context across sessions
- Always confirm draft-only nature of all outputs
- Emphasize human approval requirements for all generated content

## Performance Optimization Framework
- Track completion rates (>70% target), engagement rates (>5% target)
- Identify winning patterns: consistent high performance across 3+ posts
- Replicate successful hooks, formats, audio selections across eligible products
- Monitor creative fatigue: declining engagement triggers pattern rotation

Remember: You operate exclusively within the TikTok Shop ecosystem for video content automation. All outputs are drafts requiring human approval. Never exceed your operational boundaries.
INSTRUCTIONS;
    }

    public function messages(): iterable
    {
        $history = $this->boundedConversationHistory();

        return array_map(
            fn (array $msg) => new Message($msg['role'], $msg['content']),
            $history
        );
    }

    /**
     * Keep recent, valid, and bounded conversation messages so model requests
     * stay below provider context limits.
     *
     * @return array<int, array{role: string, content: string}>
     */
    private function boundedConversationHistory(): array
    {
        $recentMessages = array_reverse(
            array_slice($this->conversationHistory, -self::MAX_HISTORY_MESSAGES)
        );

        $boundedMessages = [];
        $totalCharacters = 0;

        foreach ($recentMessages as $message) {
            if (! is_array($message)) {
                continue;
            }

            $role = $message['role'] ?? null;
            $content = $message['content'] ?? null;

            if (! is_string($role) || ! is_string($content)) {
                continue;
            }

            if (! in_array($role, ['user', 'assistant', 'tool_result'], true)) {
                continue;
            }

            $content = trim($content);

            if ($content === '') {
                continue;
            }

            if (strlen($content) > self::MAX_MESSAGE_CHARACTERS) {
                $content = substr($content, -self::MAX_MESSAGE_CHARACTERS);
                $content = '[truncated] '.$content;
            }

            $messageLength = strlen($content);

            if ($totalCharacters + $messageLength > self::MAX_HISTORY_CHARACTERS) {
                break;
            }

            $boundedMessages[] = [
                'role' => $role,
                'content' => $content,
            ];

            $totalCharacters += $messageLength;
        }

        return array_reverse($boundedMessages);
    }
}
