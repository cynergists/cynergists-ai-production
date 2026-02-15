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
    expect($decoded['next_steps'])->toContain('Human review required before any external usage');
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
    
    expect($decoded['processing_summary']['errors'])->toBeGreaterThan(0);
    expect($decoded['validation_issues'])->not->toBeEmpty();
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