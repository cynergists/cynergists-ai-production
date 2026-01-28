<?php

namespace App\Filament\Resources\AgentSuggestions\Pages;

use App\Filament\Resources\AgentSuggestions\AgentSuggestionResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListAgentSuggestions extends ListRecords
{
    protected static string $resource = AgentSuggestionResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
