<?php

namespace App\Filament\Resources\Referrals\Schemas;

use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class ReferralForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('partner_id')
                    ->relationship('partner', 'id')
                    ->required(),
                TextInput::make('lead_email')
                    ->email()
                    ->required(),
                TextInput::make('lead_name'),
                TextInput::make('lead_phone')
                    ->tel(),
                TextInput::make('lead_company'),
                TextInput::make('source')
                    ->required(),
                TextInput::make('status')
                    ->required()
                    ->default('new'),
                TextInput::make('attribution_type')
                    ->required()
                    ->default('last_touch'),
                Textarea::make('landing_page')
                    ->columnSpanFull(),
                TextInput::make('utm_params'),
                Select::make('deal_id')
                    ->relationship('deal', 'id'),
                Textarea::make('notes')
                    ->columnSpanFull(),
                DateTimePicker::make('converted_at'),
            ]);
    }
}
