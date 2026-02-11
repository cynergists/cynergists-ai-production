<?php

namespace App\Filament\Resources\SystemEvents\RelationManagers;

use Filament\Actions\CreateAction;
use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class EmailTemplatesRelationManager extends RelationManager
{
    protected static string $relationship = 'emailTemplates';

    public function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('name')
                    ->required(),
                Select::make('recipient_type')
                    ->options([
                        'client' => 'Client',
                        'admin' => 'Admin',
                    ])
                    ->required(),
                TextInput::make('subject')
                    ->required()
                    ->helperText('Use {{ variable }} for dynamic values: {{ user_name }}, {{ agent_name }}, {{ company_name }}, etc.'),
                RichEditor::make('body')
                    ->required()
                    ->columnSpanFull()
                    ->mergeTags([
                        'user_name' => 'User Name',
                        'user_email' => 'User Email',
                        'agent_name' => 'Agent Name',
                        'agent_description' => 'Agent Description',
                        'agent_job_title' => 'Agent Job Title',
                        'tier' => 'Subscription Tier',
                        'start_date' => 'Start Date',
                        'company_name' => 'Company Name',
                        'app_name' => 'App Name',
                        'app_url' => 'App URL',
                        'portal_url' => 'Portal URL',
                        'password_reset_url' => 'Password Reset URL',
                    ]),
                Toggle::make('is_active')
                    ->default(true),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('name')
                    ->searchable(),
                TextColumn::make('recipient_type')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'client' => 'info',
                        'admin' => 'warning',
                        default => 'gray',
                    }),
                TextColumn::make('subject')
                    ->limit(50),
                IconColumn::make('is_active')
                    ->boolean(),
            ])
            ->headerActions([
                CreateAction::make(),
            ])
            ->recordActions([
                EditAction::make(),
                DeleteAction::make(),
            ]);
    }
}
