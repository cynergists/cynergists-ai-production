<?php

if (! function_exists('mt')) {
    /**
     * Generate a TipTap merge tag node for testing.
     */
    function mt(string $name): string
    {
        return '<span data-type="mergeTag" data-id="'.$name.'">{{ '.$name.' }}</span>';
    }
}
