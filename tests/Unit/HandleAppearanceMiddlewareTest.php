<?php

use App\Http\Middleware\HandleAppearance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\View;
use Tests\TestCase;

uses(TestCase::class);

it('always shares dark appearance regardless of cookie value', function () {
    $middleware = new HandleAppearance;

    $request = Request::create('/signin', 'GET', [], [
        'appearance' => 'light',
    ]);

    $response = $middleware->handle($request, fn () => response('ok'));

    expect($response->getContent())->toBe('ok');
    expect(View::shared('appearance'))->toBe('dark');
});
