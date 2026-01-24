<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CynergistsPageController extends Controller
{
    public function page(Request $request): Response
    {
        $props = $request->route()->parameters();
        $component = (string) ($props['component'] ?? '');
        unset($props['component']);

        return Inertia::render($component, $props);
    }
}
