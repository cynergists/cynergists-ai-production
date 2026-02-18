<?php

use App\Services\Arsenal\DataProcessing\ProductDataProcessor;

beforeEach(function () {
    $this->processor = new ProductDataProcessor();
});

test('processes CSV product data successfully', function () {
    $rawData = [
        [
            'name' => 'Test Product',
            'sku' => 'TEST-001',
            'description' => 'A test product description',
            'price' => '$19.99',
            'category' => 'Electronics',
        ],
    ];

    $result = $this->processor->processProductData($rawData, 'csv');

    expect($result)->toHaveKeys(['processed_products', 'processing_summary', 'validation_issues', 'draft_status']);
    expect($result['draft_status'])->toBe('DRAFT – REQUIRES HUMAN APPROVAL');
    expect($result['processed_products'])->toHaveCount(1);
});

test('normalizes CSV field names correctly', function () {
    $rawData = [
        [
            'product_title' => 'Test Product',
            'item_id' => 'TEST-001',
            'desc' => 'Description',
            'cost' => '29.99',
        ],
    ];

    $result = $this->processor->processProductData($rawData, 'csv');
    $product = $result['processed_products'][0];

    expect($product)->toHaveKey('product_name');
    expect($product)->toHaveKey('sku');
    expect($product['product_name'])->toBe('Test Product');
    expect($product['sku'])->toBe('TEST-001');
});

test('validates required fields', function () {
    $rawData = [
        [
            'description' => 'Product without name or SKU',
            'price' => '19.99',
        ],
    ];

    $result = $this->processor->processProductData($rawData, 'csv');
    $product = $result['processed_products'][0];

    expect($product['status'])->toBe('incomplete');
    expect($product['validation_issues'])->toContain('product_name');
    expect($product['validation_issues'])->toContain('sku');
});

test('detects duplicate SKUs', function () {
    $rawData = [
        [
            'name' => 'Product 1',
            'sku' => 'DUPLICATE-SKU',
            'price' => '19.99',
        ],
        [
            'name' => 'Product 2',
            'sku' => 'DUPLICATE-SKU',
            'price' => '29.99',
        ],
    ];

    $result = $this->processor->processProductData($rawData, 'csv');

    expect($result['processed_products'][1])->toHaveKey('duplicate_sku');
    expect($result['processed_products'][1]['duplicate_sku'])->toBeTrue();
});

test('standardizes price format', function () {
    $rawData = [
        [
            'name' => 'Test Product',
            'sku' => 'TEST-001',
            'price' => '$29.99',
        ],
    ];

    $result = $this->processor->processProductData($rawData, 'csv');
    $product = $result['processed_products'][0];

    expect($product['price'])->toBe(29.99);
    expect($product['price'])->toBeFloat();
});

test('standardizes category names', function () {
    $rawData = [
        [
            'name' => 'Test Product',
            'sku' => 'TEST-001',
            'category' => 'electronics',
        ],
    ];

    $result = $this->processor->processProductData($rawData, 'csv');
    $product = $result['processed_products'][0];

    expect($product['category'])->toBe('Electronics');
});

test('cleans product names', function () {
    $rawData = [
        [
            'name' => '  Test   Product   ',
            'sku' => 'TEST-001',
        ],
    ];

    $result = $this->processor->processProductData($rawData, 'csv');
    $product = $result['processed_products'][0];

    expect($product['product_name'])->toBe('Test Product');
});

test('generates processing summary', function () {
    $rawData = [
        ['name' => 'Valid Product', 'sku' => 'VALID-001'],
        ['description' => 'Invalid Product'],
    ];

    $result = $this->processor->processProductData($rawData, 'csv');
    $summary = $result['processing_summary'];

    expect($summary)->toHaveKeys(['total_input', 'total_processed', 'valid_products', 'invalid_products']);
    expect($summary['total_input'])->toBe(2);
    expect($summary['valid_products'])->toBe(1);
    expect($summary['invalid_products'])->toBe(1);
});

test('processes JSON data format', function () {
    $rawData = [
        [
            'product' => [
                'name' => 'Test Product',
                'sku' => 'TEST-001',
            ],
            'attributes' => [
                'color' => 'Red',
                'size' => 'Large',
            ],
        ],
    ];

    $result = $this->processor->processProductData($rawData, 'json');

    expect($result['processed_products'])->toHaveCount(1);
    expect($result['draft_status'])->toBe('DRAFT – REQUIRES HUMAN APPROVAL');
});

test('handles empty product data gracefully', function () {
    $rawData = [];

    $result = $this->processor->processProductData($rawData, 'csv');

    expect($result['processed_products'])->toBeEmpty();
    expect($result['processing_summary']['total_processed'])->toBe(0);
});

test('throws exception for unsupported source type', function () {
    $rawData = [['name' => 'Test']];

    expect(fn() => $this->processor->processProductData($rawData, 'unsupported'))
        ->toThrow(Exception::class);
});
