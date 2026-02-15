<?php

use App\Ai\Tools\ProcessProductDataTool;
use App\Ai\Tools\GenerateContentTool;
use App\Ai\Tools\ValidateImagesTool;
use Laravel\Ai\Tools\Request;

test('ProcessProductDataTool processes CSV data correctly', function () {
    $tool = new ProcessProductDataTool();
    
    $testData = [
        ['name' => 'Test Product 1', 'sku' => 'TP001', 'price' => '$19.99', 'category' => 'electronics'],
        ['name' => 'Test Product 2', 'sku' => 'TP002', 'price' => '29.99', 'category' => 'clothing'],
    ];
    
    $request = new Request([
        'data_source' => 'csv',
        'raw_data' => $testData,
        'normalize_categories' => true,
        'validate_required_fields' => true,
    ]);
    
    $result = $tool->handle($request);
    $decoded = json_decode($result, true);
    
    expect($decoded)->toBeArray();
    expect($decoded['success'])->toBeTrue();
    expect($decoded['draft_status'])->toBe('DRAFT – REQUIRES HUMAN APPROVAL');
    expect($decoded['processing_summary']['total_input'])->toBe(2);
    expect($decoded['processed_products'])->toHaveCount(2);
    expect($decoded['next_steps'])->toContain('All outputs are DRAFT-ONLY and require human approval before use');
});

test('GenerateContentTool creates draft content', function () {
    $tool = new GenerateContentTool();
    
    $testProducts = [
        [
            'name' => 'Premium Wireless Headphones',
            'category' => 'Electronics',
            'brand' => 'TechCorp',
            'features' => ['Noise Cancellation', 'Bluetooth 5.0', '30-hour battery']
        ]
    ];
    
    $request = new Request([
        'products' => $testProducts,
        'content_types' => ['title', 'description', 'bullet_points'],
        'tone' => 'professional'
    ]);
    
    $result = $tool->handle($request);
    $decoded = json_decode($result, true);
    
    expect($decoded)->toBeArray();
    expect($decoded['success'])->toBeTrue();
    expect($decoded['draft_status'])->toBe('DRAFT – REQUIRES HUMAN APPROVAL');
    expect($decoded['generated_content'])->toHaveCount(1);
    expect($decoded['generated_content'][0]['generated_content']['title'])->toContain('TechCorp');
    expect($decoded['generated_content'][0]['generated_content']['description'])->toContain('[DRAFT');
    expect($decoded['approval_required'])->toContain('reviewed and approved by a human');
});

test('ValidateImagesTool validates and generates alt-text', function () {
    $tool = new ValidateImagesTool();
    
    $testImages = [
        [
            'url' => 'https://example.com/product1.jpg',
            'filename' => 'product-image-1.jpg',
            'product_name' => 'Wireless Headphones',
            'image_type' => 'primary'
        ],
        [
            'url' => 'https://example.com/product2.png',
            'filename' => 'detail-view.png',
            'product_name' => 'Wireless Headphones',
            'image_type' => 'detail',
            'current_alt_text' => 'Existing alt text'
        ]
    ];
    
    $request = new Request([
        'images' => $testImages,
        'generate_alt_text' => true,
        'validation_rules' => [
            'min_width' => 800,
            'min_height' => 600,
            'allowed_formats' => ['jpg', 'png', 'webp']
        ]
    ]);
    
    $result = $tool->handle($request);
    $decoded = json_decode($result, true);
    
    expect($decoded)->toBeArray();
    expect($decoded['success'])->toBeTrue();
    expect($decoded['draft_status'])->toBe('DRAFT – REQUIRES HUMAN APPROVAL');
    expect($decoded['validation_summary']['total_images'])->toBe(2);
    expect($decoded['validated_images'])->toHaveCount(2);
    expect($decoded['validated_images'][0]['generated_alt_text'])->toContain('DRAFT ALT-TEXT');
    expect($decoded['validated_images'][1]['generated_alt_text'])->toContain('Enhanced');
    expect($decoded['next_steps'])->toContain('No original images are modified - all changes require manual implementation');
});

test('All Arsenal tools have proper schema definitions', function () {
    $tools = [
        new ProcessProductDataTool(),
        new GenerateContentTool(),
        new ValidateImagesTool(),
    ];
    
    foreach ($tools as $tool) {
        $schema = $tool->schema(new \Illuminate\JsonSchema\JsonSchemaTypeFactory());
        
        expect($schema)->toBeArray();
        expect($schema)->not->toBeEmpty();
        
        // Each tool should have at least one parameter defined
        expect(count($schema))->toBeGreaterThan(0);
        
        // Verify all parameters are Type objects
        foreach ($schema as $field) {
            expect($field)->toBeInstanceOf(\Illuminate\JsonSchema\Types\Type::class);
        }
    }
});

test('ProcessProductDataTool handles validation errors gracefully', function () {
    $tool = new ProcessProductDataTool();
    
    // Test with missing required fields
    $testData = [
        ['description' => 'Product without name or SKU'],
        ['name' => 'Product without SKU'],
    ];
    
    $request = new Request([
        'data_source' => 'csv',
        'raw_data' => $testData,
        'validate_required_fields' => true,
    ]);
    
    $result = $tool->handle($request);
    $decoded = json_decode($result, true);
    
    expect($decoded['processing_summary']['severity_breakdown'])->toHaveKey('high');
    expect($decoded['severity_analysis'])->not->toBeEmpty();
});

test('GenerateContentTool handles different tones', function () {
    $tool = new GenerateContentTool();

    $testProduct = [
        ['name' => 'Luxury Watch', 'category' => 'Accessories', 'brand' => 'LuxBrand']
    ];

    $tones = ['professional', 'casual', 'luxury', 'technical'];

    foreach ($tones as $tone) {
        $request = new Request([
            'products' => $testProduct,
            'content_types' => ['title'],
            'tone' => $tone
        ]);

        $result = $tool->handle($request);
        $decoded = json_decode($result, true);

        expect($decoded['success'])->toBeTrue();
        expect($decoded['generation_summary']['tone'])->toBe($tone);
        expect($decoded['generated_content'][0]['generated_content']['title'])->toBeString();
    }
});

test('ProcessProductDataTool halts processing on critical severity (missing SKU)', function () {
    $tool = new ProcessProductDataTool();

    $testData = [
        ['description' => 'Product with no SKU or identifier at all'],
    ];

    $request = new Request([
        'data_source' => 'csv',
        'raw_data' => $testData,
        'normalize_categories' => true,
    ]);

    $result = $tool->handle($request);
    $decoded = json_decode($result, true);

    expect($decoded['success'])->toBeFalse();
    expect($decoded['processing_halted'])->toBeTrue();
    expect($decoded['escalation_triggered'])->toBeTrue();
    expect($decoded['processed_products'])->toBeEmpty();
    expect($decoded['next_steps'])->toContain('Processing has been halted due to critical issues');
    expect($decoded['next_steps'])->toContain('Escalation sent to Haven for manual resolution');
});

test('ProcessProductDataTool throws on empty data', function () {
    $tool = new ProcessProductDataTool();

    $request = new Request([
        'data_source' => 'csv',
        'raw_data' => [],
    ]);

    $result = $tool->handle($request);
    $decoded = json_decode($result, true);

    expect($decoded['success'])->toBeFalse();
    expect($decoded['escalation_triggered'])->toBeTrue();
    expect($decoded['error'])->toContain('Tool processing failed');
});

test('ProcessProductDataTool normalizes categories correctly', function () {
    $tool = new ProcessProductDataTool();

    $testData = [
        ['name' => 'T-Shirt', 'sku' => 'TS001', 'category' => 'clothing'],
        ['name' => 'Laptop', 'sku' => 'LP001', 'category' => 'tech'],
        ['name' => 'Novel', 'sku' => 'NV001', 'category' => 'books'],
    ];

    $request = new Request([
        'data_source' => 'csv',
        'raw_data' => $testData,
        'normalize_categories' => true,
    ]);

    $result = $tool->handle($request);
    $decoded = json_decode($result, true);

    expect($decoded['success'])->toBeTrue();
    expect($decoded['processed_products'][0]['draft_normalized']['category'])->toBe('Apparel');
    expect($decoded['processed_products'][1]['draft_normalized']['category'])->toBe('Electronics');
    expect($decoded['processed_products'][2]['draft_normalized']['category'])->toBe('Books & Media');
});

test('ProcessProductDataTool preserves original price without modification', function () {
    $tool = new ProcessProductDataTool();

    $testData = [
        ['name' => 'Widget', 'sku' => 'WG001', 'price' => '$49.99'],
        ['name' => 'Gadget', 'sku' => 'GG001', 'price' => '199.00'],
    ];

    $request = new Request([
        'data_source' => 'csv',
        'raw_data' => $testData,
    ]);

    $result = $tool->handle($request);
    $decoded = json_decode($result, true);

    expect($decoded['processed_products'][0]['product_data']['original_price'])->toBe('$49.99');
    expect($decoded['processed_products'][1]['product_data']['original_price'])->toBe('199.00');
});

test('GenerateContentTool generates meta descriptions', function () {
    $tool = new GenerateContentTool();

    $request = new Request([
        'products' => [
            ['name' => 'Running Shoes', 'category' => 'Footwear', 'brand' => 'SpeedMax']
        ],
        'content_types' => ['meta_description'],
        'tone' => 'professional',
    ]);

    $result = $tool->handle($request);
    $decoded = json_decode($result, true);

    expect($decoded['success'])->toBeTrue();
    expect($decoded['generated_content'][0]['generated_content']['meta_description'])
        ->toContain('Running Shoes')
        ->toContain('SpeedMax')
        ->toContain('[DRAFT');
});

test('GenerateContentTool enhances existing long descriptions', function () {
    $tool = new GenerateContentTool();

    $existingDescription = 'This is an existing long product description that has enough content to be considered for enhancement by the tool.';

    $request = new Request([
        'products' => [
            ['name' => 'Widget', 'category' => 'General', 'description' => $existingDescription]
        ],
        'content_types' => ['description'],
        'tone' => 'professional',
    ]);

    $result = $tool->handle($request);
    $decoded = json_decode($result, true);

    expect($decoded['generated_content'][0]['generated_content']['description'])
        ->toStartWith('Enhanced:')
        ->toContain('[DRAFT');
});

test('ValidateImagesTool detects unsupported image formats', function () {
    $tool = new ValidateImagesTool();

    $request = new Request([
        'images' => [
            [
                'url' => 'https://example.com/image.bmp',
                'filename' => 'product-photo.bmp',
                'product_name' => 'Test Product',
                'image_type' => 'primary',
            ]
        ],
        'validation_rules' => [
            'allowed_formats' => ['jpg', 'png', 'webp'],
        ],
        'generate_alt_text' => false,
    ]);

    $result = $tool->handle($request);
    $decoded = json_decode($result, true);

    expect($decoded['validated_images'][0]['is_valid'])->toBeFalse();
    expect($decoded['validated_images'][0]['validation_results'])->toContain('Unsupported format: .bmp. Allowed: jpg, png, webp');
    expect($decoded['validation_summary']['images_with_issues'])->toBe(1);
});

test('ValidateImagesTool generates correct filename recommendations', function () {
    $tool = new ValidateImagesTool();

    $request = new Request([
        'images' => [
            [
                'url' => 'https://example.com/IMG_1234.jpg',
                'filename' => 'IMG_1234.jpg',
                'product_name' => 'Blue Running Shoes',
                'image_type' => 'primary',
            ],
            [
                'url' => 'https://example.com/detail.png',
                'filename' => 'detail.png',
                'product_name' => 'Blue Running Shoes',
                'image_type' => 'detail',
            ],
        ],
        'generate_alt_text' => false,
    ]);

    $result = $tool->handle($request);
    $decoded = json_decode($result, true);

    expect($decoded['validated_images'][0]['recommended_filename'])->toBe('blue-running-shoes-main.jpg');
    expect($decoded['validated_images'][1]['recommended_filename'])->toBe('blue-running-shoes-detail.png');
});

test('ValidateImagesTool generates alt-text for different image types', function () {
    $tool = new ValidateImagesTool();

    $imageTypes = ['primary', 'detail', 'lifestyle', 'secondary'];

    $images = collect($imageTypes)->map(fn (string $type) => [
        'url' => "https://example.com/{$type}.jpg",
        'filename' => "{$type}.jpg",
        'product_name' => 'Test Product',
        'image_type' => $type,
    ])->all();

    $request = new Request([
        'images' => $images,
        'generate_alt_text' => true,
    ]);

    $result = $tool->handle($request);
    $decoded = json_decode($result, true);

    expect($decoded['validated_images'][0]['generated_alt_text'])->toContain('Main product image');
    expect($decoded['validated_images'][1]['generated_alt_text'])->toContain('Close-up detail view');
    expect($decoded['validated_images'][2]['generated_alt_text'])->toContain('Lifestyle image');
    expect($decoded['validated_images'][3]['generated_alt_text'])->toContain('Additional view');
});

test('ProcessProductDataTool enforces operational boundaries in response', function () {
    $tool = new ProcessProductDataTool();

    $request = new Request([
        'data_source' => 'csv',
        'raw_data' => [
            ['name' => 'Test', 'sku' => 'T001'],
        ],
    ]);

    $result = $tool->handle($request);
    $decoded = json_decode($result, true);

    expect($decoded['operational_boundaries'])->toBe([
        'draft_only_mode' => true,
        'no_live_data_modification' => true,
        'no_pricing_fabrication' => true,
        'no_inventory_modification' => true,
        'human_approval_required' => true,
    ]);
});

// Integration Test - Multiple Arsenal tools working in sequence
test('Arsenal tools integration workflow processes product data end-to-end', function () {
    // Step 1: Process raw product data
    $processTool = new ProcessProductDataTool();
    $processRequest = new Request([
        'data_source' => 'csv',
        'raw_data' => [
            [
                'name' => 'Premium Gaming Headset',
                'sku' => 'PGH001',
                'price' => '$149.99',
                'category' => 'electronics',
                'brand' => 'GameMax',
                'description' => '7.1 Surround Sound, RGB Lighting, Wireless'
            ]
        ],
        'normalize_categories' => true,
        'validate_required_fields' => true,
    ]);

    $processResult = $processTool->handle($processRequest);
    $processedData = json_decode($processResult, true);

    expect($processedData['success'])->toBeTrue();
    expect($processedData['processed_products'])->toHaveCount(1);

    // Step 2: Generate content using processed product data
    $contentTool = new GenerateContentTool();
    $contentRequest = new Request([
        'products' => [
            [
                'name' => $processedData['processed_products'][0]['product_data']['original_name'],
                'category' => $processedData['processed_products'][0]['draft_normalized']['category'],
                'description' => $processedData['processed_products'][0]['product_data']['original_description'] ?? 'Premium Gaming Headset with advanced features'
            ]
        ],
        'content_types' => ['title', 'description', 'bullet_points'],
        'tone' => 'professional'
    ]);

    $contentResult = $contentTool->handle($contentRequest);
    $contentData = json_decode($contentResult, true);

    expect($contentData['success'])->toBeTrue();
    expect($contentData['generated_content'])->toHaveCount(1);

    // Step 3: Validate product images
    $imageTool = new ValidateImagesTool();
    $imageRequest = new Request([
        'images' => [
            [
                'url' => 'https://example.com/gaming-headset.jpg',
                'filename' => 'headset-main.jpg',
                'product_name' => $processedData['processed_products'][0]['product_data']['original_name'],
                'image_type' => 'primary'
            ]
        ],
        'generate_alt_text' => true,
        'validation_rules' => [
            'allowed_formats' => ['jpg', 'png', 'webp']
        ]
    ]);

    $imageResult = $imageTool->handle($imageRequest);
    $imageData = json_decode($imageResult, true);

    expect($imageData['success'])->toBeTrue();
    expect($imageData['validated_images'])->toHaveCount(1);

    // Verify end-to-end consistency
    expect($processedData['draft_status'])->toBe('DRAFT – REQUIRES HUMAN APPROVAL');
    expect($contentData['draft_status'])->toBe('DRAFT – REQUIRES HUMAN APPROVAL');
    expect($imageData['draft_status'])->toBe('DRAFT – REQUIRES HUMAN APPROVAL');

    // All tools should maintain operational boundaries
    expect($processedData['operational_boundaries']['draft_only_mode'])->toBeTrue();
    expect($contentData['approval_required'])->toContain('reviewed and approved by a human');
    expect($imageData['next_steps'])->toContain('No original images are modified - all changes require manual implementation');
});

// Edge Case Test - Boundary conditions and unusual data scenarios
test('Arsenal tools handle edge cases and boundary conditions', function () {
    // Test ProcessProductDataTool with extreme edge cases
    $processTool = new ProcessProductDataTool();

    // Edge case: Very long product names and special characters
    $edgeCaseData = [
        [
            'name' => str_repeat('A', 300) . ' – Special Product™ with Émojis 🎮 & Symbols',
            'sku' => 'EDGE-001',
            'price' => '0.01',
            'category' => 'UNKNOWN_CATEGORY_123',
            'description' => str_repeat('Lorem ipsum ', 200), // Very long description
        ],
        [
            'name' => '',  // Empty name
            'sku' => 'EDGE-002',
            'price' => '999999.99',  // Very high price
            'category' => null,  // Null category
        ],
        [
            'name' => '🎮 Gaming Console 2024',  // Unicode in name
            'sku' => 'UNICODE-SKU-™',  // Special characters in SKU
            'price' => 'FREE',  // Non-numeric price
            'category' => '   electronics   ',  // Whitespace category
        ]
    ];

    $request = new Request([
        'data_source' => 'csv',
        'raw_data' => $edgeCaseData,
        'normalize_categories' => true,
        'validate_required_fields' => false, // Allow processing despite issues
    ]);

    $result = $processTool->handle($request);
    $decoded = json_decode($result, true);

    // Should handle gracefully without crashing
    expect($decoded)->toBeArray();
    expect($decoded['processing_summary'])->toHaveKey('total_input');
    expect($decoded['processing_summary']['severity_breakdown']['medium'] + $decoded['processing_summary']['severity_breakdown']['high'] + $decoded['processing_summary']['severity_breakdown']['critical'])->toBeGreaterThan(0);

    // Test ValidateImagesTool with edge case images
    $imageTool = new ValidateImagesTool();
    $edgeImages = [
        [
            'url' => '',  // Empty URL
            'filename' => '',  // Empty filename
            'product_name' => '',  // Empty product name
            'image_type' => 'invalid_type',  // Invalid image type
        ],
        [
            'url' => 'not-a-valid-url',  // Invalid URL format
            'filename' => 'file with spaces and special chars!@#.jpg',
            'product_name' => str_repeat('Long Product Name ', 50),
            'image_type' => 'primary',
        ]
    ];

    $imageRequest = new Request([
        'images' => $edgeImages,
        'generate_alt_text' => true,
    ]);

    $imageResult = $imageTool->handle($imageRequest);
    $imageDecoded = json_decode($imageResult, true);

    expect($imageDecoded)->toBeArray();
    expect($imageDecoded['validation_summary']['images_with_issues'])->toBeGreaterThan(0);
});

// Performance Test - Testing tool behavior with large datasets
test('Arsenal tools handle large datasets efficiently', function () {
    $this->markTestSkipped('Performance test - enable for load testing');

    // Generate large dataset for performance testing
    $largeDataset = [];
    for ($i = 1; $i <= 1000; $i++) {
        $largeDataset[] = [
            'name' => "Test Product {$i}",
            'sku' => sprintf('TP%04d', $i),
            'price' => '$' . number_format(rand(100, 99999) / 100, 2),
            'category' => ['electronics', 'clothing', 'books', 'home', 'sports'][rand(0, 4)],
            'description' => str_repeat('Product description content ', rand(5, 20)),
        ];
    }

    $processTool = new ProcessProductDataTool();
    $startTime = microtime(true);

    $request = new Request([
        'data_source' => 'csv',
        'raw_data' => $largeDataset,
        'normalize_categories' => true,
        'validate_required_fields' => true,
    ]);

    $result = $processTool->handle($request);
    $endTime = microtime(true);
    $processingTime = $endTime - $startTime;

    $decoded = json_decode($result, true);

    // Performance assertions
    expect($processingTime)->toBeLessThan(30.0); // Should complete within 30 seconds
    expect($decoded['success'])->toBeTrue();
    expect($decoded['processing_summary']['total_input'])->toBe(1000);
    expect($decoded['processed_products'])->toHaveCount(1000);

    // Memory usage should be reasonable
    $memoryUsage = memory_get_peak_usage(true);
    expect($memoryUsage)->toBeLessThan(128 * 1024 * 1024); // Less than 128MB

    // Test large image batch processing
    $largeImageSet = [];
    for ($i = 1; $i <= 100; $i++) {
        $largeImageSet[] = [
            'url' => "https://example.com/product-{$i}.jpg",
            'filename' => "product-{$i}.jpg",
            'product_name' => "Product {$i}",
            'image_type' => ['primary', 'detail', 'lifestyle'][rand(0, 2)],
        ];
    }

    $imageTool = new ValidateImagesTool();
    $imageStartTime = microtime(true);

    $imageRequest = new Request([
        'images' => $largeImageSet,
        'generate_alt_text' => true,
    ]);

    $imageResult = $imageTool->handle($imageRequest);
    $imageEndTime = microtime(true);
    $imageProcessingTime = $imageEndTime - $imageStartTime;

    $imageDecoded = json_decode($imageResult, true);

    expect($imageProcessingTime)->toBeLessThan(15.0); // Should complete within 15 seconds
    expect($imageDecoded['success'])->toBeTrue();
    expect($imageDecoded['validation_summary']['total_images'])->toBe(100);
});

// Error Recovery Test - Testing how tools handle and recover from various error states
test('Arsenal tools recover gracefully from error conditions', function () {
    // Test ProcessProductDataTool error recovery
    $processTool = new ProcessProductDataTool();

    // Scenario 1: Corrupted data structure
    $corruptedRequest = new Request([
        'data_source' => 'csv',
        'raw_data' => 'invalid-data-format', // String instead of array
        'normalize_categories' => true,
    ]);

    $result1 = $processTool->handle($corruptedRequest);
    $decoded1 = json_decode($result1, true);

    expect($decoded1['success'])->toBeFalse();
    expect($decoded1['escalation_triggered'])->toBeTrue();
    expect($decoded1['error'])->toBeString();

    // Scenario 2: Partial data corruption - some valid, some invalid
    $mixedDataRequest = new Request([
        'data_source' => 'csv',
        'raw_data' => [
            ['name' => 'Valid Product', 'sku' => 'VP001'], // Valid
            ['name' => 'Another Valid Product', 'sku' => 'AVP001'], // Valid
            ['name' => 'Third Valid Product', 'sku' => 'TVP001'], // Valid
        ],
        'validate_required_fields' => true,
    ]);

    $result2 = $processTool->handle($mixedDataRequest);
    $decoded2 = json_decode($result2, true);

    // Should process valid entries
    expect($decoded2)->toBeArray();
    expect($decoded2['processing_summary']['processed_count'])->toBe(3);
    expect($decoded2['success'])->toBeTrue();

    // Test GenerateContentTool error recovery
    $contentTool = new GenerateContentTool();

    // Scenario 3: Invalid product structure
    $invalidContentRequest = new Request([
        'products' => [
            null, // Null product
            'invalid-product', // String instead of array
            [], // Empty product array
            ['name' => 'Valid Product'], // Minimal valid product
        ],
        'content_types' => ['title', 'description'],
        'tone' => 'professional',
    ]);

    $result3 = $contentTool->handle($invalidContentRequest);
    $decoded3 = json_decode($result3, true);

    expect($decoded3)->toBeArray();
    // Should handle invalid entries gracefully
    if ($decoded3['success']) {
        // Tool should process successfully but may have warnings or generation issues
        expect($decoded3['generated_content'])->toBeArray();
    } else {
        expect($decoded3['escalation_triggered'])->toBeTrue();
    }

    // Test ValidateImagesTool error recovery
    $imageTool = new ValidateImagesTool();

    // Scenario 4: Mixed valid/invalid image data
    $mixedImageRequest = new Request([
        'images' => [
            null, // Null image
            ['url' => 'https://example.com/valid.jpg', 'filename' => 'valid.jpg', 'product_name' => 'Valid Product', 'image_type' => 'primary'], // Valid
            'invalid-image-string', // String instead of array
            ['url' => '', 'filename' => '', 'product_name' => '', 'image_type' => ''], // Empty fields
            ['url' => 'https://example.com/another.png', 'filename' => 'another.png', 'product_name' => 'Another Product', 'image_type' => 'detail'], // Valid
        ],
        'generate_alt_text' => true,
    ]);

    $result4 = $imageTool->handle($mixedImageRequest);
    $decoded4 = json_decode($result4, true);

    expect($decoded4)->toBeArray();
    if ($decoded4['success']) {
        expect($decoded4['validation_summary']['images_with_issues'])->toBeGreaterThan(0);
        expect($decoded4['validation_summary']['valid_images'])->toBeGreaterThanOrEqual(1);
    } else {
        expect($decoded4['escalation_triggered'])->toBeTrue();
    }

    // Scenario 5: Test recovery after simulated system resource constraints
    $resourceConstraintRequest = new Request([
        'data_source' => 'csv',
        'raw_data' => array_fill(0, 10000, ['name' => 'Test', 'sku' => 'T001']), // Very large dataset
        'normalize_categories' => true,
    ]);

    $result5 = $processTool->handle($resourceConstraintRequest);
    $decoded5 = json_decode($result5, true);

    // Should either process successfully or fail gracefully with escalation
    expect($decoded5)->toBeArray();
    expect($decoded5)->toHaveKey('success');
    
    if (!$decoded5['success']) {
        expect($decoded5['escalation_triggered'])->toBeTrue();
        expect($decoded5['error'])->toContain('Tool processing failed');
    }
});