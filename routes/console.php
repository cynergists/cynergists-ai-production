<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('apex:run-campaigns')->dailyAt('09:00');
Schedule::command('apex:sync-linkedin')->dailyAt('09:00');
