<?php

namespace App\Providers\Filament;

use App\Http\Middleware\EnsureAdminUser;
use Filament\Http\Middleware\Authenticate;
use Filament\Http\Middleware\AuthenticateSession;
use Filament\Http\Middleware\DisableBladeIconComponents;
use Filament\Http\Middleware\DispatchServingFilamentEvent;
use Filament\Navigation\MenuItem;
use Filament\Navigation\NavigationGroup;
use Filament\Pages\Dashboard;
use Filament\Panel;
use Filament\PanelProvider;
use Filament\Support\Colors\Color;
use Filament\Support\Facades\FilamentView;
use Filament\View\PanelsRenderHook;
use Filament\Widgets\AccountWidget;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Routing\Middleware\SubstituteBindings;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\Support\HtmlString;
use Illuminate\View\Middleware\ShareErrorsFromSession;

class AdminPanelProvider extends PanelProvider
{
    public function boot(): void
    {
        // Set sidebar collapsed by default on first visit
        FilamentView::registerRenderHook(
            PanelsRenderHook::HEAD_START,
            fn (): HtmlString => new HtmlString(<<<'HTML'
                <script>
                    // Only set default if no preference exists yet
                    if (localStorage.getItem('_x_isOpen') === null) {
                        localStorage.setItem('_x_isOpen', 'false');
                    }
                </script>
                <style>
                    .fi-sidebar-header .fi-logo {
                        margin-top: 0.5rem;
                        margin-bottom: 0.5rem;
                    }
                </style>
            HTML),
        );
    }

    public function panel(Panel $panel): Panel
    {
        return $panel
            ->default()
            ->id('admin')
            ->path('filament')
            ->login()
            ->brandName('Cynergists AI')
            ->brandLogo(asset('logo-admin.webp'))
            ->darkModeBrandLogo(asset('logo-admin.webp'))
            ->brandLogoHeight('4rem')
            ->favicon(asset('favicon.png'))
            ->darkMode(true)
            ->colors([
                'primary' => '#84cc16',  // Tailwind lime-500: exact match for homepage
                'gray' => Color::Slate,
            ])
            ->navigationGroups([
                NavigationGroup::make()
                    ->label('AI Agents')
                    ->icon('heroicon-o-sparkles'),
                NavigationGroup::make()
                    ->label('Carbon')
                    ->icon('heroicon-o-magnifying-glass'),
                NavigationGroup::make()
                    ->label('Client Portal')
                    ->icon('heroicon-o-building-office'),
                NavigationGroup::make()
                    ->label('User Management')
                    ->icon('heroicon-o-users'),
                NavigationGroup::make()
                    ->label('Partners')
                    ->icon('heroicon-o-user-group')
                    ->collapsed(),
                NavigationGroup::make()
                    ->label('Billing')
                    ->icon('heroicon-o-credit-card'),
                NavigationGroup::make()
                    ->label('Staff')
                    ->icon('heroicon-o-briefcase'),
                NavigationGroup::make()
                    ->label('Reports')
                    ->icon('heroicon-o-chart-bar'),
            ])
            ->sidebarCollapsibleOnDesktop()
            ->userMenuItems([
                MenuItem::make()
                    ->label('Back to Home')
                    ->url('/')
                    ->icon('heroicon-o-home'),
            ])
            ->discoverResources(in: app_path('Filament/Resources'), for: 'App\Filament\Resources')
            ->discoverPages(in: app_path('Filament/Pages'), for: 'App\Filament\Pages')
            ->pages([
                Dashboard::class,
            ])
            ->discoverWidgets(in: app_path('Filament/Widgets'), for: 'App\Filament\Widgets')
            ->widgets([
                AccountWidget::class,
            ])
            ->middleware([
                EncryptCookies::class,
                AddQueuedCookiesToResponse::class,
                StartSession::class,
                AuthenticateSession::class,
                ShareErrorsFromSession::class,
                VerifyCsrfToken::class,
                SubstituteBindings::class,
                DisableBladeIconComponents::class,
                DispatchServingFilamentEvent::class,
            ])
            ->authMiddleware([
                Authenticate::class,
                EnsureAdminUser::class,
            ]);
    }
}
