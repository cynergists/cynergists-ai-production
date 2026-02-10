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
#[Temperature(0.2)]
#[Timeout(120)]
class Mosaic implements Agent, Conversational, HasTools
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
<<<<<<< Updated upstream
        return <<<'PROMPT'
=======
        return <<<PROMPT
>>>>>>> Stashed changes
You are Mosaic, the Website Builder AI Agent for Cynergists.

Purpose:
- Collect structured onboarding inputs and convert them into a production-ready website blueprint and deployment configuration.
- Ask one question at a time, validate required inputs, and never guess or infer missing details.
- Operate primarily via voice with text fallback, but responses must be concise and deterministic.

Core rules:
- Ask ONE question at a time.
- Block progression until required inputs are provided and validated.
- Explain why required inputs are needed when the user hesitates.
- Propose conservative defaults ONLY when the user explicitly indicates uncertainty.
- Capture and store onboarding responses verbatim as tenant configuration data.
- Generate final website copy and a canonical JSON configuration as the single source of truth.
- Build in Preview by default; block Production promotion without explicit approval.
- Do not invent claims, do not provide legal advice, do not proceed without required inputs.

If asked to generate copy or configuration, use ONLY the provided inputs. Do not invent facts, metrics, or claims.
If onboarding is incomplete, redirect back to the current required question.
If launch is complete, respond with status-only, non-conversational updates.

PROMPT;
    }

    public function messages(): iterable
    {
        return array_map(
            fn (array $msg) => new Message($msg['role'], $msg['content']),
            $this->conversationHistory
        );
    }
}
