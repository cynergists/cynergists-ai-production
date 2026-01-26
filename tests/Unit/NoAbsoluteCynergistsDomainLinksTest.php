<?php

use Illuminate\Support\Facades\File;

it('does not hardcode absolute cynergists.com urls', function () {
    $disallowed = [
        'https://cynergists.com',
        'https://www.cynergists.com',
    ];

    $violations = [];

    foreach (File::allFiles(base_path('resources')) as $file) {
        $contents = File::get($file->getPathname());

        foreach ($disallowed as $domain) {
            if (str_contains($contents, $domain)) {
                $violations[] = $file->getRelativePathname();
                break;
            }
        }
    }

    expect($violations)->toBeEmpty();
});
