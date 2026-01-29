<?php

namespace App\Filament\Resources\AgentApiKeys\Pages;

use App\Filament\Resources\AgentApiKeys\AgentApiKeyResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditAgentApiKey extends EditRecord
{
    protected static string $resource = AgentApiKeyResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
