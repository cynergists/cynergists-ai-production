<?php

use App\Services\Arsenal\DataProcessing\ContentGenerator;

beforeEach(function () {
    $this->generator = new ContentGenerator();
});

test('generates complete product content', function () {
    $productData = [
        'product_name' => 'Premium Wireless Headphones',
        'brand' => 'AudioTech',
        'category' => 'Electronics',
        'sku' => 'AT-WH-001',
    ];

    $result = $this->generator->generateProductContent($productData);

    expect($result)->toHaveKeys(['draft_title', 'draft_description', 'bullet_points', 'seo_metadata', 'draft_status']);
    expect($result['draft_status'])->toBe('DRAFT – REQUIRES HUMAN APPROVAL');
});

test('generates draft title within SEO length', function () {
    $productData = [
        'product_name' => 'Premium Wireless Noise Cancelling Over-Ear Headphones',
        'brand' => 'AudioTech',
        'sku' => 'AT-WH-001',
    ];

    $result = $this->generator->generateProductContent($productData);

    expect(strlen($result['draft_title']))->toBeLessThanOrEqual(70);
    expect($result['draft_title'])->toContain('AudioTech');
});

test('generates draft description with brand', function () {
    $productData = [
        'product_name' => 'Wireless Headphones',
        'brand' => 'AudioTech',
        'category' => 'Electronics',
        'sku' => 'TEST-001',
    ];

    $result = $this->generator->generateProductContent($productData);

    expect($result['draft_description'])->toContain('AudioTech');
    expect($result['draft_description'])->toContain('Wireless Headphones');
});

test('generates bullet points from product data', function () {
    $productData = [
        'product_name' => 'Wireless Headphones',
        'brand' => 'AudioTech',
        'category' => 'Electronics',
        'sku' => 'AT-WH-001',
        'materials' => 'Premium leather and aluminum',
    ];

    $result = $this->generator->generateProductContent($productData);

    expect($result['bullet_points'])->toBeArray();
    expect(count($result['bullet_points']))->toBeGreaterThan(0);
    expect($result['bullet_points'])->toContain('Brand: AudioTech');
    expect($result['bullet_points'])->toContain('SKU: AT-WH-001');
});

test('generates SEO metadata with proper length limits', function () {
    $productData = [
        'product_name' => 'Wireless Headphones',
        'brand' => 'AudioTech',
        'category' => 'Electronics',
        'sku' => 'TEST-001',
    ];

    $result = $this->generator->generateProductContent($productData);
    $seo = $result['seo_metadata'];

    expect($seo)->toHaveKeys(['meta_title', 'meta_description', 'keywords', 'og_title', 'og_description']);
    expect(strlen($seo['meta_title']))->toBeLessThanOrEqual(60);
    expect(strlen($seo['meta_description']))->toBeLessThanOrEqual(155);
});

test('applies casual brand tone', function () {
    $productData = [
        'product_name' => 'Wireless Headphones',
        'brand' => 'AudioTech',
        'category' => 'Electronics',
        'sku' => 'TEST-001',
    ];

    $brandTone = ['tone' => 'casual'];

    $result = $this->generator->generateProductContent($productData, $brandTone);

    expect($result['draft_description'])->toContain('Check out');
});

test('applies luxury brand tone', function () {
    $productData = [
        'product_name' => 'Wireless Headphones',
        'brand' => 'AudioTech',
        'category' => 'Electronics',
        'sku' => 'TEST-001',
    ];

    $brandTone = ['tone' => 'luxury'];

    $result = $this->generator->generateProductContent($productData, $brandTone);

    expect($result['draft_description'])->toContain('Experience');
});

test('generates batch content for multiple products', function () {
    $products = [
        [
            'product_name' => 'Product 1',
            'sku' => 'SKU-001',
            'category' => 'Electronics',
        ],
        [
            'product_name' => 'Product 2',
            'sku' => 'SKU-002',
            'category' => 'Apparel',
        ],
    ];

    $result = $this->generator->generateBatchContent($products);

    expect($result)->toHaveKeys(['generated_content', 'total_processed', 'successful', 'failed']);
    expect($result['total_processed'])->toBe(2);
    expect($result['successful'])->toBe(2);
    expect($result['draft_status'])->toBe('DRAFT – REQUIRES HUMAN APPROVAL');
});

test('validates content meets minimum requirements', function () {
    $validContent = [
        'draft_title' => 'Premium Wireless Headphones',
        'draft_description' => 'Discover Premium Wireless Headphones from AudioTech. This Electronics device offers modern features.',
        'bullet_points' => ['Brand: AudioTech', 'Category: Electronics', 'SKU: TEST-001'],
    ];

    $result = $this->generator->validateContent($validContent);

    expect($result['valid'])->toBeTrue();
    expect($result['issues'])->toBeEmpty();
});

test('detects invalid content with missing title', function () {
    $invalidContent = [
        'draft_title' => '',
        'draft_description' => 'A valid description that is long enough to pass validation',
        'bullet_points' => ['Point 1', 'Point 2', 'Point 3'],
    ];

    $result = $this->generator->validateContent($invalidContent);

    expect($result['valid'])->toBeFalse();
    expect($result['issues'])->toContain('Title is missing');
});

test('detects content with short description', function () {
    $content = [
        'draft_title' => 'Valid Title',
        'draft_description' => 'Too short',
        'bullet_points' => ['Point 1', 'Point 2', 'Point 3'],
    ];

    $result = $this->generator->validateContent($content);

    expect($result['issues'])->toContain('Description is too short (minimum 50 characters recommended)');
});

test('limits bullet points to maximum of 8', function () {
    $productData = [
        'product_name' => 'Product',
        'sku' => 'SKU-001',
        'brand' => 'Brand',
        'category' => 'Category',
        'materials' => 'Materials',
        'dimensions' => 'Dimensions',
        'features' => ['Feature 1', 'Feature 2', 'Feature 3', 'Feature 4', 'Feature 5', 'Feature 6'],
    ];

    $result = $this->generator->generateProductContent($productData);

    expect(count($result['bullet_points']))->toBeLessThanOrEqual(8);
});
