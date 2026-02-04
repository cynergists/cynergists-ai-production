<?php

namespace App\Filament\Resources\AgentKnowledgeBases\Schemas;

use Filament\Forms\Components\MarkdownEditor;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;

class AgentKnowledgeBaseForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->columns(2)
            ->components([
                Select::make('agent_name')
                    ->label('Agent')
                    ->required()
                    ->unique(ignoreRecord: true)
                    ->options(self::getAvailableAgents())
                    ->searchable()
                    ->native(false)
                    ->helperText('Select the agent this knowledge base is for'),

                TextInput::make('title')
                    ->label('Title')
                    ->required()
                    ->placeholder('Cynessa Knowledge Base v1.1')
                    ->maxLength(255),

                TextInput::make('version')
                    ->label('Version')
                    ->placeholder('v1.1')
                    ->maxLength(255),

                Toggle::make('is_active')
                    ->label('Active')
                    ->default(true)
                    ->helperText('Only active knowledge bases are used by agents'),

                MarkdownEditor::make('content')
                    ->label('Content')
                    ->required()
                    ->helperText('Markdown formatted knowledge base content. This will be injected into the agent\'s system prompt when relevant questions are asked.')
                    ->columnSpanFull()
                    ->toolbarButtons([
                        'bold',
                        'bulletList',
                        'codeBlock',
                        'heading',
                        'italic',
                        'link',
                        'orderedList',
                        'redo',
                        'strike',
                        'table',
                        'undo',
                    ]),
            ]);
    }

    /**
     * Get available agents for the knowledge base.
     */
    protected static function getAvailableAgents(): array
    {
        // Get agents from portal_available_agents table
        $agents = \App\Models\PortalAvailableAgent::query()
            ->orderBy('name')
            ->pluck('name', 'name')
            ->toArray();

        // If no agents in database, return default list
        if (empty($agents)) {
            return [
                'cynessa' => 'Cynessa',
                'apex' => 'Apex',
            ];
        }

        return $agents;
    }
}

