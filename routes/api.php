<?php

use App\Http\Controllers\Api\UserCynergistStatusController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/user-cynergist-status', UserCynergistStatusController::class);
