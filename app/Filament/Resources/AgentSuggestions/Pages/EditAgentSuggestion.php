<?php

namespace App\Filament\Resources\AgentSuggestions\Pages;

use App\Filament\Resources\AgentSuggestions\AgentSuggestionResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditAgentSuggestion extends EditRecord
{
    protected static string $resource = AgentSuggestionResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
