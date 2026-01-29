<?php

namespace App\Filament\Resources\AgentApiKeys\Pages;

use App\Filament\Resources\AgentApiKeys\AgentApiKeyResource;
use Filament\Resources\Pages\CreateRecord;

class CreateAgentApiKey extends CreateRecord
{
    protected static string $resource = AgentApiKeyResource::class;
}
