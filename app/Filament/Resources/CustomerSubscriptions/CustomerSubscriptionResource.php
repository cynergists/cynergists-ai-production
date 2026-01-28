<?php

namespace App\Filament\Resources\CustomerSubscriptions;

use App\Filament\Resources\CustomerSubscriptions\Pages\CreateCustomerSubscription;
use App\Filament\Resources\CustomerSubscriptions\Pages\EditCustomerSubscription;
use App\Filament\Resources\CustomerSubscriptions\Pages\ListCustomerSubscriptions;
use App\Filament\Resources\CustomerSubscriptions\Schemas\CustomerSubscriptionForm;
use App\Filament\Resources\CustomerSubscriptions\Tables\CustomerSubscriptionsTable;
use App\Models\CustomerSubscription;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class CustomerSubscriptionResource extends Resource
{
    protected static ?string $model = CustomerSubscription::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedCreditCard;

    protected static string|\UnitEnum|null $navigationGroup = 'Billing';

    protected static ?int $navigationSort = 1;

    protected static ?string $navigationLabel = 'Subscriptions';

    public static function form(Schema $schema): Schema
    {
        return CustomerSubscriptionForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return CustomerSubscriptionsTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListCustomerSubscriptions::route('/'),
            'create' => CreateCustomerSubscription::route('/create'),
            'edit' => EditCustomerSubscription::route('/{record}/edit'),
        ];
    }
}
