<laravel-boost-guidelines>
=== foundation rules ===

# Laravel Boost Guidelines

The Laravel Boost guidelines are specifically curated by Laravel maintainers for this application. These guidelines should be followed closely to enhance the user's satisfaction building Laravel applications.

## Foundational Context
This application is a Laravel application and its main Laravel ecosystems package & versions are below. You are an expert with them all. Ensure you abide by these specific packages & versions.

- php - 8.4.8
- filament/filament (FILAMENT) - v5
- inertiajs/inertia-laravel (INERTIA) - v2
- laravel/ai (AI) - v0
- laravel/fortify (FORTIFY) - v1
- laravel/framework (LARAVEL) - v12
- laravel/prompts (PROMPTS) - v0
- laravel/sanctum (SANCTUM) - v4
- laravel/wayfinder (WAYFINDER) - v0
- livewire/livewire (LIVEWIRE) - v4
- laravel/mcp (MCP) - v0
- laravel/pint (PINT) - v1
- laravel/sail (SAIL) - v1
- pestphp/pest (PEST) - v4
- phpunit/phpunit (PHPUNIT) - v12
- @inertiajs/react (INERTIA) - v2
- react (REACT) - v18
- tailwindcss (TAILWINDCSS) - v4
- @laravel/vite-plugin-wayfinder (WAYFINDER) - v0
- eslint (ESLINT) - v9
- prettier (PRETTIER) - v3

## Conventions
- You must follow all existing code conventions used in this application. When creating or editing a file, check sibling files for the correct structure, approach, and naming.
- Use descriptive names for variables and methods. For example, `isRegisteredForDiscounts`, not `discount()`.
- Check for existing components to reuse before writing a new one.

## Verification Scripts
- Do not create verification scripts or tinker when tests cover that functionality and prove it works. Unit and feature tests are more important.

## Application Structure & Architecture
- Stick to existing directory structure; don't create new base folders without approval.
- Do not change the application's dependencies without approval.

## Frontend Bundling
- If the user doesn't see a frontend change reflected in the UI, it could mean they need to run `npm run build`, `npm run dev`, or `composer run dev`. Ask them.

## Replies
- Be concise in your explanations - focus on what's important rather than explaining obvious details.

## Documentation Files
- You must only create documentation files if explicitly requested by the user.

=== boost rules ===

## Laravel Boost
- Laravel Boost is an MCP server that comes with powerful tools designed specifically for this application. Use them.

## Artisan
- Use the `list-artisan-commands` tool when you need to call an Artisan command to double-check the available parameters.

## URLs
- Whenever you share a project URL with the user, you should use the `get-absolute-url` tool to ensure you're using the correct scheme, domain/IP, and port.

## Tinker / Debugging
- You should use the `tinker` tool when you need to execute PHP to debug code or query Eloquent models directly.
- Use the `database-query` tool when you only need to read from the database.

## Reading Browser Logs With the `browser-logs` Tool
- You can read browser logs, errors, and exceptions using the `browser-logs` tool from Boost.
- Only recent browser logs will be useful - ignore old logs.

## Searching Documentation (Critically Important)
- Boost comes with a powerful `search-docs` tool you should use before any other approaches when dealing with Laravel or Laravel ecosystem packages. This tool automatically passes a list of installed packages and their versions to the remote Boost API, so it returns only version-specific documentation for the user's circumstance. You should pass an array of packages to filter on if you know you need docs for particular packages.
- The `search-docs` tool is perfect for all Laravel-related packages, including Laravel, Inertia, Livewire, Filament, Tailwind, Pest, Nova, Nightwatch, etc.
- You must use this tool to search for Laravel ecosystem documentation before falling back to other approaches.
- Search the documentation before making code changes to ensure we are taking the correct approach.
- Use multiple, broad, simple, topic-based queries to start. For example: `['rate limiting', 'routing rate limiting', 'routing']`.
- Do not add package names to queries; package information is already shared. For example, use `test resource table`, not `filament 4 test resource table`.

### Available Search Syntax
- You can and should pass multiple queries at once. The most relevant results will be returned first.

1. Simple Word Searches with auto-stemming - query=authentication - finds 'authenticate' and 'auth'.
2. Multiple Words (AND Logic) - query=rate limit - finds knowledge containing both "rate" AND "limit".
3. Quoted Phrases (Exact Position) - query="infinite scroll" - words must be adjacent and in that order.
4. Mixed Queries - query=middleware "rate limit" - "middleware" AND exact phrase "rate limit".
5. Multiple Queries - queries=["authentication", "middleware"] - ANY of these terms.

=== php rules ===

## PHP

- Always use curly braces for control structures, even if it has one line.

### Constructors
- Use PHP 8 constructor property promotion in `__construct()`.
    - <code-snippet>public function __construct(public GitHub $github) { }</code-snippet>
- Do not allow empty `__construct()` methods with zero parameters unless the constructor is private.

### Type Declarations
- Always use explicit return type declarations for methods and functions.
- Use appropriate PHP type hints for method parameters.

<code-snippet name="Explicit Return Types and Method Params" lang="php">
protected function isAccessible(User $user, ?string $path = null): bool
{
    ...
}
</code-snippet>

## Comments
- Prefer PHPDoc blocks over inline comments. Never use comments within the code itself unless there is something very complex going on.

## PHPDoc Blocks
- Add useful array shape type definitions for arrays when appropriate.

## Enums
- Typically, keys in an Enum should be TitleCase. For example: `FavoritePerson`, `BestLake`, `Monthly`.

=== herd rules ===

## Laravel Herd

- The application is served by Laravel Herd and will be available at: `https?://[kebab-case-project-dir].test`. Use the `get-absolute-url` tool to generate URLs for the user to ensure valid URLs.
- You must not run any commands to make the site available via HTTP(S). It is always available through Laravel Herd.

=== tests rules ===

## Test Enforcement

- Every change must be programmatically tested. Write a new test or update an existing test, then run the affected tests to make sure they pass.
- Run the minimum number of tests needed to ensure code quality and speed. Use `php artisan test --compact` with a specific filename or filter.

=== inertia-laravel/core rules ===

## Inertia

- Inertia.js components should be placed in the `resources/js/Pages` directory unless specified differently in the JS bundler (`vite.config.js`).
- Use `Inertia::render()` for server-side routing instead of traditional Blade views.
- Use the `search-docs` tool for accurate guidance on all things Inertia.

<code-snippet name="Inertia Render Example" lang="php">
// routes/web.php example
Route::get('/users', function () {
    return Inertia::render('Users/Index', [
        'users' => User::all()
    ]);
});
</code-snippet>

=== inertia-laravel/v2 rules ===

## Inertia v2

- Make use of all Inertia features from v1 and v2. Check the documentation before making any changes to ensure we are taking the correct approach.

### Inertia v2 New Features
- Deferred props.
- Infinite scrolling using merging props and `WhenVisible`.
- Lazy loading data on scroll.
- Polling.
- Prefetching.

### Deferred Props & Empty States
- When using deferred props on the frontend, you should add a nice empty state with pulsing/animated skeleton.

### Inertia Form General Guidance
- The recommended way to build forms when using Inertia is with the `<Form>` component - a useful example is below. Use the `search-docs` tool with a query of `form component` for guidance.
- Forms can also be built using the `useForm` helper for more programmatic control, or to follow existing conventions. Use the `search-docs` tool with a query of `useForm helper` for guidance.
- `resetOnError`, `resetOnSuccess`, and `setDefaultsOnSuccess` are available on the `<Form>` component. Use the `search-docs` tool with a query of `form component resetting` for guidance.

=== laravel/core rules ===

## Do Things the Laravel Way

- Use `php artisan make:` commands to create new files (i.e. migrations, controllers, models, etc.). You can list available Artisan commands using the `list-artisan-commands` tool.
- If you're creating a generic PHP class, use `php artisan make:class`.
- Pass `--no-interaction` to all Artisan commands to ensure they work without user input. You should also pass the correct `--options` to ensure correct behavior.

### Database
- Always use proper Eloquent relationship methods with return type hints. Prefer relationship methods over raw queries or manual joins.
- Use Eloquent models and relationships before suggesting raw database queries.
- Avoid `DB::`; prefer `Model::query()`. Generate code that leverages Laravel's ORM capabilities rather than bypassing them.
- Generate code that prevents N+1 query problems by using eager loading.
- Use Laravel's query builder for very complex database operations.

### Model Creation
- When creating new models, create useful factories and seeders for them too. Ask the user if they need any other things, using `list-artisan-commands` to check the available options to `php artisan make:model`.

### APIs & Eloquent Resources
- For APIs, default to using Eloquent API Resources and API versioning unless existing API routes do not, then you should follow existing application convention.

### Controllers & Validation
- Always create Form Request classes for validation rather than inline validation in controllers. Include both validation rules and custom error messages.
- Check sibling Form Requests to see if the application uses array or string based validation rules.

### Queues
- Use queued jobs for time-consuming operations with the `ShouldQueue` interface.

### Authentication & Authorization
- Use Laravel's built-in authentication and authorization features (gates, policies, Sanctum, etc.).

### URL Generation
- When generating links to other pages, prefer named routes and the `route()` function.

### Configuration
- Use environment variables only in configuration files - never use the `env()` function directly outside of config files. Always use `config('app.name')`, not `env('APP_NAME')`.

### Testing
- When creating models for tests, use the factories for the models. Check if the factory has custom states that can be used before manually setting up the model.
- Faker: Use methods such as `$this->faker->word()` or `fake()->randomDigit()`. Follow existing conventions whether to use `$this->faker` or `fake()`.
- When creating tests, make use of `php artisan make:test [options] {name}` to create a feature test, and pass `--unit` to create a unit test. Most tests should be feature tests.

### Vite Error
- If you receive an "Illuminate\Foundation\ViteException: Unable to locate file in Vite manifest" error, you can run `npm run build` or ask the user to run `npm run dev` or `composer run dev`.

=== laravel/v12 rules ===

## Laravel 12

- Use the `search-docs` tool to get version-specific documentation.
- Since Laravel 11, Laravel has a new streamlined file structure which this project uses.

### Laravel 12 Structure
- In Laravel 12, middleware are no longer registered in `app/Http/Kernel.php`.
- Middleware are configured declaratively in `bootstrap/app.php` using `Application::configure()->withMiddleware()`.
- `bootstrap/app.php` is the file to register middleware, exceptions, and routing files.
- `bootstrap/providers.php` contains application specific service providers.
- The `app\Console\Kernel.php` file no longer exists; use `bootstrap/app.php` or `routes/console.php` for console configuration.
- Console commands in `app/Console/Commands/` are automatically available and do not require manual registration.

### Database
- When modifying a column, the migration must include all of the attributes that were previously defined on the column. Otherwise, they will be dropped and lost.
- Laravel 12 allows limiting eagerly loaded records natively, without external packages: `$query->latest()->limit(10);`.

### Models
- Casts can and likely should be set in a `casts()` method on a model rather than the `$casts` property. Follow existing conventions from other models.

=== wayfinder/core rules ===

## Laravel Wayfinder

Wayfinder generates TypeScript functions and types for Laravel controllers and routes which you can import into your client-side code. It provides type safety and automatic synchronization between backend routes and frontend code.

### Development Guidelines
- Always use the `search-docs` tool to check Wayfinder correct usage before implementing any features.
- Always prefer named imports for tree-shaking (e.g., `import { show } from '@/actions/...'`).
- Avoid default controller imports (prevents tree-shaking).
- Run `php artisan wayfinder:generate` after route changes if Vite plugin isn't installed.

### Feature Overview
- Form Support: Use `.form()` with `--with-form` flag for HTML form attributes — `<form {...store.form()}>` → `action="/posts" method="post"`.
- HTTP Methods: Call `.get()`, `.post()`, `.patch()`, `.put()`, `.delete()` for specific methods — `show.head(1)` → `{ url: "/posts/1", method: "head" }`.
- Invokable Controllers: Import and invoke directly as functions. For example, `import StorePost from '@/actions/.../StorePostController'; StorePost()`.
- Named Routes: Import from `@/routes/` for non-controller routes. For example, `import { show } from '@/routes/post'; show(1)` for route name `post.show`.
- Parameter Binding: Detects route keys (e.g., `{post:slug}`) and accepts matching object properties — `show("my-post")` or `show({ slug: "my-post" })`.
- Query Merging: Use `mergeQuery` to merge with `window.location.search`, set values to `null` to remove — `show(1, { mergeQuery: { page: 2, sort: null } })`.
- Query Parameters: Pass `{ query: {...} }` in options to append params — `show(1, { query: { page: 1 } })` → `"/posts/1?page=1"`.
- Route Objects: Functions return `{ url, method }` shaped objects — `show(1)` → `{ url: "/posts/1", method: "get" }`.
- URL Extraction: Use `.url()` to get URL string — `show.url(1)` → `"/posts/1"`.

### Example Usage

<code-snippet name="Wayfinder Basic Usage" lang="typescript">
    // Import controller methods (tree-shakable)...
    import { show, store, update } from '@/actions/App/Http/Controllers/PostController'

    // Get route object with URL and method...
    show(1) // { url: "/posts/1", method: "get" }

    // Get just the URL...
    show.url(1) // "/posts/1"

    // Use specific HTTP methods...
    show.get(1) // { url: "/posts/1", method: "get" }
    show.head(1) // { url: "/posts/1", method: "head" }

    // Import named routes...
    import { show as postShow } from '@/routes/post' // For route name 'post.show'
    postShow(1) // { url: "/posts/1", method: "get" }
</code-snippet>

### Wayfinder + Inertia
If your application uses the `<Form>` component from Inertia, you can use Wayfinder to generate form action and method automatically.
<code-snippet name="Wayfinder Form Component (React)" lang="typescript">

<Form {...store.form()}><input name="title" /></Form>

</code-snippet>

=== livewire/core rules ===

## Livewire

- Use the `search-docs` tool to find exact version-specific documentation for how to write Livewire and Livewire tests.
- Use the `php artisan make:livewire [Posts\CreatePost]` Artisan command to create new components.
- State should live on the server, with the UI reflecting it.
- All Livewire requests hit the Laravel backend; they're like regular HTTP requests. Always validate form data and run authorization checks in Livewire actions.

## Livewire Best Practices
- Livewire components require a single root element.
- Use `wire:loading` and `wire:dirty` for delightful loading states.
- Add `wire:key` in loops:

    ```blade
    @foreach ($items as $item)
        <div wire:key="item-{{ $item->id }}">
            {{ $item->name }}
        </div>
    @endforeach
    ```

- Prefer lifecycle hooks like `mount()`, `updatedFoo()` for initialization and reactive side effects:

<code-snippet name="Lifecycle Hook Examples" lang="php">
    public function mount(User $user) { $this->user = $user; }
    public function updatedSearch() { $this->resetPage(); }
</code-snippet>

## Testing Livewire

<code-snippet name="Example Livewire Component Test" lang="php">
    Livewire::test(Counter::class)
        ->assertSet('count', 0)
        ->call('increment')
        ->assertSet('count', 1)
        ->assertSee(1)
        ->assertStatus(200);
</code-snippet>

<code-snippet name="Testing Livewire Component Exists on Page" lang="php">
    $this->get('/posts/create')
    ->assertSeeLivewire(CreatePost::class);
</code-snippet>

=== pint/core rules ===

## Laravel Pint Code Formatter

- You must run `vendor/bin/pint --dirty` before finalizing changes to ensure your code matches the project's expected style.
- Do not run `vendor/bin/pint --test`, simply run `vendor/bin/pint` to fix any formatting issues.

=== pest/core rules ===

## Pest
### Testing
- If you need to verify a feature is working, write or update a Unit / Feature test.

### Pest Tests
- All tests must be written using Pest. Use `php artisan make:test --pest {name}`.
- You must not remove any tests or test files from the tests directory without approval. These are not temporary or helper files - these are core to the application.
- Tests should test all of the happy paths, failure paths, and weird paths.
- Tests live in the `tests/Feature` and `tests/Unit` directories.
- Pest tests look and behave like this:
<code-snippet name="Basic Pest Test Example" lang="php">
it('is true', function () {
    expect(true)->toBeTrue();
});
</code-snippet>

### Running Tests
- Run the minimal number of tests using an appropriate filter before finalizing code edits.
- To run all tests: `php artisan test --compact`.
- To run all tests in a file: `php artisan test --compact tests/Feature/ExampleTest.php`.
- To filter on a particular test name: `php artisan test --compact --filter=testName` (recommended after making a change to a related file).
- When the tests relating to your changes are passing, ask the user if they would like to run the entire test suite to ensure everything is still passing.

### Pest Assertions
- When asserting status codes on a response, use the specific method like `assertForbidden` and `assertNotFound` instead of using `assertStatus(403)` or similar, e.g.:
<code-snippet name="Pest Example Asserting postJson Response" lang="php">
it('returns all', function () {
    $response = $this->postJson('/api/docs', []);

    $response->assertSuccessful();
});
</code-snippet>

### Mocking
- Mocking can be very helpful when appropriate.
- When mocking, you can use the `Pest\Laravel\mock` Pest function, but always import it via `use function Pest\Laravel\mock;` before using it. Alternatively, you can use `$this->mock()` if existing tests do.
- You can also create partial mocks using the same import or self method.

### Datasets
- Use datasets in Pest to simplify tests that have a lot of duplicated data. This is often the case when testing validation rules, so consider this solution when writing tests for validation rules.

<code-snippet name="Pest Dataset Example" lang="php">
it('has emails', function (string $email) {
    expect($email)->not->toBeEmpty();
})->with([
    'james' => 'james@laravel.com',
    'taylor' => 'taylor@laravel.com',
]);
</code-snippet>

=== pest/v4 rules ===

## Pest 4

- Pest 4 is a huge upgrade to Pest and offers: browser testing, smoke testing, visual regression testing, test sharding, and faster type coverage.
- Browser testing is incredibly powerful and useful for this project.
- Browser tests should live in `tests/Browser/`.
- Use the `search-docs` tool for detailed guidance on utilizing these features.

### Browser Testing
- You can use Laravel features like `Event::fake()`, `assertAuthenticated()`, and model factories within Pest 4 browser tests, as well as `RefreshDatabase` (when needed) to ensure a clean state for each test.
- Interact with the page (click, type, scroll, select, submit, drag-and-drop, touch gestures, etc.) when appropriate to complete the test.
- If requested, test on multiple browsers (Chrome, Firefox, Safari).
- If requested, test on different devices and viewports (like iPhone 14 Pro, tablets, or custom breakpoints).
- Switch color schemes (light/dark mode) when appropriate.
- Take screenshots or pause tests for debugging when appropriate.

### Example Tests

<code-snippet name="Pest Browser Test Example" lang="php">
it('may reset the password', function () {
    Notification::fake();

    $this->actingAs(User::factory()->create());

    $page = visit('/sign-in'); // Visit on a real browser...

    $page->assertSee('Sign In')
        ->assertNoJavascriptErrors() // or ->assertNoConsoleLogs()
        ->click('Forgot Password?')
        ->fill('email', 'nuno@laravel.com')
        ->click('Send Reset Link')
        ->assertSee('We have emailed your password reset link!')

    Notification::assertSent(ResetPassword::class);
});
</code-snippet>

<code-snippet name="Pest Smoke Testing Example" lang="php">
$pages = visit(['/', '/about', '/contact']);

$pages->assertNoJavascriptErrors()->assertNoConsoleLogs();
</code-snippet>

=== inertia-react/core rules ===

## Inertia + React

- Use `router.visit()` or `<Link>` for navigation instead of traditional links.

<code-snippet name="Inertia Client Navigation" lang="react">

import { Link } from '@inertiajs/react'
<Link href="/">Home</Link>

</code-snippet>

=== inertia-react/v2/forms rules ===

## Inertia v2 + React Forms

<code-snippet name="`<Form>` Component Example" lang="react">

import { Form } from '@inertiajs/react'

export default () => (
    <Form action="/users" method="post">
        {({
            errors,
            hasErrors,
            processing,
            wasSuccessful,
            recentlySuccessful,
            clearErrors,
            resetAndClearErrors,
            defaults
        }) => (
        <>
        <input type="text" name="name" />

        {errors.name && <div>{errors.name}</div>}

        <button type="submit" disabled={processing}>
            {processing ? 'Creating...' : 'Create User'}
        </button>

        {wasSuccessful && <div>User created successfully!</div>}
        </>
    )}
    </Form>
)

</code-snippet>

=== tailwindcss/core rules ===

## Tailwind CSS

- Use Tailwind CSS classes to style HTML; check and use existing Tailwind conventions within the project before writing your own.
- Offer to extract repeated patterns into components that match the project's conventions (i.e. Blade, JSX, Vue, etc.).
- Think through class placement, order, priority, and defaults. Remove redundant classes, add classes to parent or child carefully to limit repetition, and group elements logically.
- You can use the `search-docs` tool to get exact examples from the official documentation when needed.

### Spacing
- When listing items, use gap utilities for spacing; don't use margins.

<code-snippet name="Valid Flex Gap Spacing Example" lang="html">
    <div class="flex gap-8">
        <div>Superior</div>
        <div>Michigan</div>
        <div>Erie</div>
    </div>
</code-snippet>

### Dark Mode
- If existing pages and components support dark mode, new pages and components must support dark mode in a similar way, typically using `dark:`.

=== tailwindcss/v4 rules ===

## Tailwind CSS 4

- Always use Tailwind CSS v4; do not use the deprecated utilities.
- `corePlugins` is not supported in Tailwind v4.
- In Tailwind v4, configuration is CSS-first using the `@theme` directive — no separate `tailwind.config.js` file is needed.

<code-snippet name="Extending Theme in CSS" lang="css">
@theme {
  --color-brand: oklch(0.72 0.11 178);
}
</code-snippet>

- In Tailwind v4, you import Tailwind using a regular CSS `@import` statement, not using the `@tailwind` directives used in v3:

<code-snippet name="Tailwind v4 Import Tailwind Diff" lang="diff">
   - @tailwind base;
   - @tailwind components;
   - @tailwind utilities;
   + @import "tailwindcss";
</code-snippet>

### Replaced Utilities
- Tailwind v4 removed deprecated utilities. Do not use the deprecated option; use the replacement.
- Opacity values are still numeric.

| Deprecated |	Replacement |
|------------+--------------|
| bg-opacity-* | bg-black/* |
| text-opacity-* | text-black/* |
| border-opacity-* | border-black/* |
| divide-opacity-* | divide-black/* |
| ring-opacity-* | ring-black/* |
| placeholder-opacity-* | placeholder-black/* |
| flex-shrink-* | shrink-* |
| flex-grow-* | grow-* |
| overflow-ellipsis | text-ellipsis |
| decoration-slice | box-decoration-slice |
| decoration-clone | box-decoration-clone |

=== laravel-ai/core rules ===

## Laravel AI SDK

The Laravel AI SDK provides a unified, expressive API for interacting with AI providers such as OpenAI, Anthropic, Gemini, and more. Use the `search-docs` tool for version-specific documentation.

### Configuration

- API keys should be configured in `.env` file, never hardcoded.
- Default providers are configured in `config/ai.php`.
- Use `config('ai.default')` instead of `env('AI_DEFAULT_PROVIDER')` in application code.

### Agents

Agents are the fundamental building block for AI interactions. Each agent is a dedicated PHP class.

#### Creating Agents

- Always use Artisan commands to create agents: `php artisan make:agent AgentName`.
- Use `--structured` flag when the agent should return structured data: `php artisan make:agent SalesCoach --structured`.
- Agents should be placed in `app/Ai/Agents/` directory.

#### Agent Structure Best Practices

- Agents must implement the `Laravel\Ai\Contracts\Agent` interface.
- Use `Promptable` trait for standard prompting functionality.
- Implement additional interfaces based on needs:
  - `Conversational` - For agents that need conversation context.
  - `HasTools` - For agents that use tools.
  - `HasStructuredOutput` - For agents returning structured data.
  - `HasMiddleware` - For agents with middleware.
  - `RemembersConversations` - For automatic conversation storage.

<code-snippet name="Basic Agent Structure" lang="php">
<?php

namespace App\Ai\Agents;

use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Promptable;
use Stringable;

class SalesCoach implements Agent
{
    use Promptable;

    public function __construct(public User $user) {}

    public function instructions(): Stringable|string
    {
        return 'You are a sales coach analyzing transcripts.';
    }
}
</code-snippet>

#### Prompting Agents

- Use the `prompt()` method to interact with agents.
- Provider, model, and timeout can be overridden per-prompt.
- Always handle responses appropriately (string cast, array access for structured output).

<code-snippet name="Prompting Agent Examples" lang="php">
// Basic prompting...
$response = (new SalesCoach)->prompt('Analyze this transcript...');
return (string) $response;

// With constructor dependency...
$response = SalesCoach::make($user)->prompt('Analyze...');

// Override provider and model...
$response = (new SalesCoach)->prompt(
    'Analyze this...',
    provider: 'anthropic',
    model: 'claude-sonnet-4-5-20250929',
    timeout: 120,
);
</code-snippet>

#### Conversation Context

- Implement `Conversational` interface to provide message history.
- Return messages as iterable of `Laravel\Ai\Messages\Message` objects.
- Order messages chronologically (oldest first).
- Limit conversation history to prevent token overflow (typically 50-100 messages).

<code-snippet name="Conversational Agent" lang="php">
use Laravel\Ai\Contracts\Conversational;
use Laravel\Ai\Messages\Message;

class SalesCoach implements Agent, Conversational
{
    use Promptable;

    public function messages(): iterable
    {
        return History::where('user_id', $this->user->id)
            ->latest()
            ->limit(50)
            ->get()
            ->reverse()
            ->map(fn ($msg) => new Message($msg->role, $msg->content))
            ->all();
    }
}
</code-snippet>

#### Conversation Memory

- Use `RemembersConversations` trait for automatic storage.
- Start new conversations with `forUser()` method.
- Continue conversations with `continue()` method.
- Conversations are stored in `agent_conversations` and `agent_conversation_messages` tables.

<code-snippet name="Agent with Conversation Memory" lang="php">
use Laravel\Ai\Concerns\RemembersConversations;
use Laravel\Ai\Contracts\Conversational;

class SalesCoach implements Agent, Conversational
{
    use Promptable, RemembersConversations;

    // Start new conversation...
    $response = (new SalesCoach)->forUser($user)->prompt('Hello!');
    $conversationId = $response->conversationId;

    // Continue existing conversation...
    $response = (new SalesCoach)
        ->continue($conversationId, as: $user)
        ->prompt('Tell me more.');
}
</code-snippet>

#### Structured Output

- Implement `HasStructuredOutput` for type-safe responses.
- Define JSON schema in `schema()` method.
- Access structured data using array syntax.
- All schema fields should be properly validated.

<code-snippet name="Structured Output Agent" lang="php">
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\HasStructuredOutput;

class SalesCoach implements Agent, HasStructuredOutput
{
    use Promptable;

    public function schema(JsonSchema $schema): array
    {
        return [
            'feedback' => $schema->string()->required(),
            'score' => $schema->integer()->min(1)->max(10)->required(),
            'recommendations' => $schema->array()->items($schema->string()),
        ];
    }
}

// Usage...
$response = (new SalesCoach)->prompt('Analyze...');
$score = $response['score'];
$feedback = $response['feedback'];
</code-snippet>

#### Attachments

- Use `Laravel\Ai\Files` classes for attachments.
- Support documents (PDF, MD, TXT) and images (JPG, PNG, etc.).
- Files can be from storage, paths, URLs, or uploaded files.

<code-snippet name="Agent with Attachments" lang="php">
use Laravel\Ai\Files;

$response = (new SalesCoach)->prompt(
    'Analyze the attached transcript...',
    attachments: [
        Files\Document::fromStorage('transcript.pdf'),
        Files\Document::fromPath('/path/to/file.md'),
        Files\Image::fromUrl('https://example.com/photo.jpg'),
        $request->file('document'),
    ]
);
</code-snippet>

#### Streaming Responses

- Use `stream()` method for real-time responses.
- Return stream directly from routes for SSE.
- Use `then()` callback for post-processing.
- Support Vercel AI SDK protocol with `usingVercelDataProtocol()`.

<code-snippet name="Streaming Agent Responses" lang="php">
// Basic streaming...
Route::get('/coach', function () {
    return (new SalesCoach)->stream('Analyze this...');
});

// With callback...
return (new SalesCoach)
    ->stream('Analyze this...')
    ->then(function (StreamedAgentResponse $response) {
        // Access $response->text, $response->events, $response->usage
    });

// Using Vercel AI SDK protocol...
return (new SalesCoach)
    ->stream('Analyze...')
    ->usingVercelDataProtocol();
</code-snippet>

#### Broadcasting

- Stream events can be broadcast to channels.
- Queue agent operations with broadcasting.

<code-snippet name="Broadcasting Streamed Events" lang="php">
use Illuminate\Broadcasting\Channel;

// Broadcast each event...
$stream = (new SalesCoach)->stream('Analyze...');
foreach ($stream as $event) {
    $event->broadcast(new Channel('channel-name'));
}

// Or queue with broadcasting...
(new SalesCoach)->broadcastOnQueue(
    'Analyze...',
    new Channel('channel-name'),
);
</code-snippet>

#### Queueing

- Use `queue()` method for background processing.
- Provide `then()` and `catch()` callbacks.
- Queued operations respect queue configuration.

<code-snippet name="Queueing Agent Operations" lang="php">
Route::post('/coach', function (Request $request) {
    (new SalesCoach)
        ->queue($request->input('transcript'))
        ->then(function (AgentResponse $response) {
            // Handle success...
        })
        ->catch(function (Throwable $e) {
            // Handle error...
        });

    return back();
});
</code-snippet>

#### Agent Configuration

- Use PHP attributes for agent configuration.
- Attributes override class-level defaults.
- Support cost/capability optimization attributes.

<code-snippet name="Agent Configuration with Attributes" lang="php">
use Laravel\Ai\Attributes\{MaxSteps, MaxTokens, Provider, Temperature, Timeout};

#[MaxSteps(10)]
#[MaxTokens(4096)]
#[Provider('anthropic')]
#[Temperature(0.7)]
#[Timeout(120)]
class SalesCoach implements Agent
{
    use Promptable;
}

// Cost optimization...
use Laravel\Ai\Attributes\UseCheapestModel;

#[UseCheapestModel]
class SimpleSummarizer implements Agent
{
    use Promptable;
    // Uses cheapest model (e.g., Haiku)
}

// Capability optimization...
use Laravel\Ai\Attributes\UseSmartestModel;

#[UseSmartestModel]
class ComplexReasoner implements Agent
{
    use Promptable;
    // Uses most capable model (e.g., Opus)
}
</code-snippet>

#### Anonymous Agents

- Use `agent()` helper for ad-hoc agents.
- Useful for simple, one-off operations.
- Supports all agent features (tools, schema, etc.).

<code-snippet name="Anonymous Agent" lang="php">
use function Laravel\Ai\{agent};

$response = agent(
    instructions: 'You are an expert at software development.',
    messages: [],
    tools: [],
)->prompt('Tell me about Laravel');

// With structured output...
use Illuminate\Contracts\JsonSchema\JsonSchema;

$response = agent(
    schema: fn (JsonSchema $schema) => [
        'number' => $schema->integer()->required(),
    ],
)->prompt('Generate a random number less than 100');
</code-snippet>

### Tools

Tools extend agent capabilities with additional functionality.

#### Creating Tools

- Always use Artisan: `php artisan make:tool ToolName`.
- Tools should be placed in `app/Ai/Tools/` directory.
- Implement `Laravel\Ai\Contracts\Tool` interface.

<code-snippet name="Custom Tool Structure" lang="php">
<?php

namespace App\Ai\Tools;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;
use Stringable;

class RandomNumberGenerator implements Tool
{
    public function description(): Stringable|string
    {
        return 'Generate cryptographically secure random numbers.';
    }

    public function handle(Request $request): Stringable|string
    {
        return (string) random_int($request['min'], $request['max']);
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'min' => $schema->integer()->min(0)->required(),
            'max' => $schema->integer()->required(),
        ];
    }
}
</code-snippet>

#### Similarity Search Tool

- Use for RAG (Retrieval Augmented Generation).
- Requires PostgreSQL with pgvector extension.
- Can filter by query builder or custom closure.

<code-snippet name="Similarity Search Tool" lang="php">
use App\Models\Document;
use Laravel\Ai\Tools\SimilaritySearch;

class DocumentAgent implements Agent, HasTools
{
    use Promptable;

    public function tools(): iterable
    {
        return [
            // Basic similarity search...
            SimilaritySearch::usingModel(Document::class, 'embedding'),

            // With filtering...
            SimilaritySearch::usingModel(
                model: Document::class,
                column: 'embedding',
                minSimilarity: 0.7,
                limit: 10,
                query: fn ($query) => $query->where('published', true),
            ),

            // Custom closure...
            new SimilaritySearch(using: function (string $query) {
                return Document::query()
                    ->where('user_id', $this->user->id)
                    ->whereVectorSimilarTo('embedding', $query)
                    ->limit(10)
                    ->get();
            }),
        ];
    }
}
</code-snippet>

#### Provider Tools

- Provider tools are implemented natively by AI providers.
- Available: WebSearch, WebFetch, FileSearch.

<code-snippet name="Provider Tools" lang="php">
use Laravel\Ai\Providers\Tools\{WebSearch, WebFetch, FileSearch};

public function tools(): iterable
{
    return [
        // Web search with filtering...
        (new WebSearch)->max(5)->allow(['laravel.com', 'php.net']),

        // Web search with location...
        (new WebSearch)->location(
            city: 'New York',
            region: 'NY',
            country: 'US'
        ),

        // Web fetch with domain restrictions...
        (new WebFetch)->max(3)->allow(['docs.laravel.com']),

        // File search in vector stores...
        new FileSearch(stores: ['store_id'], where: [
            'author' => 'Taylor Otwell',
            'year' => 2026,
        ]),
    ];
}
</code-snippet>

### Images

- Generate images using OpenAI, Gemini, or xAI.
- Control quality and aspect ratio.
- Support reference images for style transfer.

<code-snippet name="Image Generation" lang="php">
use Laravel\Ai\Image;
use Laravel\Ai\Files;

// Basic generation...
$image = Image::of('A donut on the counter')->generate();
$rawContent = (string) $image;

// With options...
$image = Image::of('A donut on the counter')
    ->quality('high')
    ->landscape()
    ->timeout(120)
    ->generate();

// With reference images...
$image = Image::of('Update this photo to impressionist style.')
    ->attachments([
        Files\Image::fromStorage('photo.jpg'),
        Files\Image::fromPath('/path/to/photo.jpg'),
        Files\Image::fromUrl('https://example.com/photo.jpg'),
        $request->file('photo'),
    ])
    ->landscape()
    ->generate();

// Store generated images...
$path = $image->store();
$path = $image->storeAs('image.jpg');
$path = $image->storePublicly();

// Queue generation...
Image::of('A donut on the counter')
    ->portrait()
    ->queue()
    ->then(function (ImageResponse $image) {
        $path = $image->store();
    });
</code-snippet>

### Audio (TTS)

- Generate audio from text using OpenAI or ElevenLabs.
- Control voice selection.
- Add generation instructions.

<code-snippet name="Audio Generation" lang="php">
use Laravel\Ai\Audio;

// Basic generation...
$audio = Audio::of('I love coding with Laravel.')->generate();
$rawContent = (string) $audio;

// With voice control...
$audio = Audio::of('I love coding with Laravel.')
    ->female()
    ->instructions('Said like a pirate')
    ->generate();

// Custom voice...
$audio = Audio::of('I love coding with Laravel.')
    ->voice('voice-id-or-name')
    ->generate();

// Store audio...
$path = $audio->store();
$path = $audio->storeAs('audio.mp3');

// Queue generation...
Audio::of('I love coding with Laravel.')
    ->queue()
    ->then(function (AudioResponse $audio) {
        $path = $audio->store();
    });
</code-snippet>

### Transcription (STT)

- Generate transcripts from audio files.
- Support diarization (speaker separation).

<code-snippet name="Audio Transcription" lang="php">
use Laravel\Ai\Transcription;

// Basic transcription...
$transcript = Transcription::fromPath('/path/audio.mp3')->generate();
$transcript = Transcription::fromStorage('audio.mp3')->generate();
$transcript = Transcription::fromUpload($request->file('audio'))->generate();
return (string) $transcript;

// With diarization...
$transcript = Transcription::fromStorage('audio.mp3')
    ->diarize()
    ->generate();

// Queue transcription...
Transcription::fromStorage('audio.mp3')
    ->queue()
    ->then(function (TranscriptionResponse $transcript) {
        // Handle transcription...
    });
</code-snippet>

### Embeddings

- Generate vector embeddings for semantic search.
- Support multiple providers (OpenAI, Gemini, Cohere, etc.).
- Use with PostgreSQL pgvector extension.

<code-snippet name="Embeddings Generation" lang="php">
use Illuminate\Support\Str;
use Laravel\Ai\Embeddings;

// Single input using Stringable...
$embeddings = Str::of('Napa Valley has great wine.')->toEmbeddings();

// Multiple inputs...
$response = Embeddings::for([
    'Napa Valley has great wine.',
    'Laravel is a PHP framework.',
])->generate();

$response->embeddings; // [[0.123, ...], [0.789, ...]]

// With options...
$response = Embeddings::for(['Text to embed'])
    ->dimensions(1536)
    ->generate('openai', 'text-embedding-3-small');
</code-snippet>

#### Vector Columns

- Use PostgreSQL with pgvector extension.
- Define vector columns in migrations.
- Add indexes for performance.

<code-snippet name="Vector Columns Migration" lang="php">
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

Schema::ensureVectorExtensionExists();

Schema::create('documents', function (Blueprint $table) {
    $table->id();
    $table->string('title');
    $table->text('content');
    $table->vector('embedding', dimensions: 1536)->index();
    $table->timestamps();
});
</code-snippet>

#### Querying Embeddings

- Cast vector columns as arrays in models.
- Use `whereVectorSimilarTo()` for semantic search.
- Support string queries (auto-embedded).

<code-snippet name="Vector Similarity Search" lang="php">
use App\Models\Document;

// With embedding vector...
$documents = Document::query()
    ->whereVectorSimilarTo('embedding', $queryEmbedding, minSimilarity: 0.4)
    ->limit(10)
    ->get();

// With string (auto-embeds)...
$documents = Document::query()
    ->whereVectorSimilarTo('embedding', 'best wineries in Napa Valley')
    ->limit(10)
    ->get();

// Low-level methods...
$documents = Document::query()
    ->select('*')
    ->selectVectorDistance('embedding', $queryEmbedding, as: 'distance')
    ->whereVectorDistanceLessThan('embedding', $queryEmbedding, 0.3)
    ->orderByVectorDistance('embedding', $queryEmbedding)
    ->limit(10)
    ->get();
</code-snippet>

#### Caching Embeddings

- Enable globally in `config/ai.php` or per-request.
- Cache embeddings to reduce API costs.
- Configurable cache duration.

<code-snippet name="Caching Embeddings" lang="php">
// Enable caching for specific request...
$response = Embeddings::for(['Text to embed'])
    ->cache()
    ->generate();

// Cache with custom duration (seconds)...
$response = Embeddings::for(['Text to embed'])
    ->cache(seconds: 3600)
    ->generate();

// With Stringable...
$embeddings = Str::of('Text')->toEmbeddings(cache: true);
$embeddings = Str::of('Text')->toEmbeddings(cache: 3600);
</code-snippet>

### Reranking

- Rerank documents by relevance to a query.
- Improves search result quality.
- Works with arrays or collections.

<code-snippet name="Reranking Documents" lang="php">
use Laravel\Ai\Reranking;

// Basic reranking...
$response = Reranking::of([
    'Django is a Python web framework.',
    'Laravel is a PHP web application framework.',
    'React is a JavaScript library.',
])->rerank('PHP frameworks');

$response->first()->document; // "Laravel is a PHP..."
$response->first()->score;    // 0.95
$response->first()->index;    // 1 (original position)

// With limit...
$response = Reranking::of($documents)
    ->limit(5)
    ->rerank('search query');

// Reranking collections...
$posts = Post::all()->rerank('body', 'Laravel tutorials');

// Multiple fields...
$reranked = $posts->rerank(['title', 'body'], 'Laravel tutorials');

// Custom closure...
$reranked = $posts->rerank(
    fn ($post) => $post->title.': '.$post->body,
    'Laravel tutorials'
);

// With options...
$reranked = $posts->rerank(
    by: 'content',
    query: 'Laravel tutorials',
    limit: 10,
    provider: 'cohere'
);
</code-snippet>

### Files

- Store files with AI providers for reuse.
- Support documents and images.
- Attach stored files to prompts.

<code-snippet name="File Storage" lang="php">
use Laravel\Ai\Files\{Document, Image};

// Store files...
$response = Document::fromPath('/path/file.pdf')->put();
$response = Image::fromStorage('photo.jpg')->put();
$response = Document::fromUrl('https://example.com/doc.pdf')->put();
$response = Document::fromString('Hello, World!', 'text/plain')->put();
$response = Document::fromUpload($request->file('document'))->put();

$fileId = $response->id;

// Reference stored files...
$response = (new SalesCoach)->prompt(
    'Analyze the document...',
    attachments: [
        Files\Document::fromId('file-id'),
    ]
);

// Retrieve file info...
$file = Document::fromId('file-id')->get();
$file->id;
$file->mimeType();

// Delete files...
Document::fromId('file-id')->delete();
</code-snippet>

### Vector Stores

- Create searchable collections of files.
- Enable RAG with FileSearch tool.
- Manage file metadata for filtering.

<code-snippet name="Vector Stores" lang="php">
use Laravel\Ai\Stores;
use Laravel\Ai\Files\Document;

// Create store...
$store = Stores::create('Knowledge Base');
$store = Stores::create(
    name: 'Knowledge Base',
    description: 'Documentation and reference materials.',
    expiresWhenIdleFor: days(30),
);

// Get existing store...
$store = Stores::get('store_id');

// Add files to store...
$document = $store->add('file_id');
$document = $store->add(Document::fromPath('/path/doc.pdf'));
$document = $store->add(Document::fromStorage('manual.pdf'));

// Add with metadata...
$store->add(Document::fromPath('/path/doc.pdf'), metadata: [
    'author' => 'Taylor Otwell',
    'department' => 'Engineering',
    'year' => 2026,
]);

// Remove files...
$store->remove('file_id');
$store->remove('file_id', deleteFile: true);

// Delete store...
$store->delete();
Stores::delete('store_id');
</code-snippet>

### Failover

- Provide multiple providers for automatic failover.
- First available provider is used.
- Applies to agents, images, audio, transcription.

<code-snippet name="Provider Failover" lang="php">
// Agent failover...
$response = (new SalesCoach)->prompt(
    'Analyze this...',
    provider: ['openai', 'anthropic'],
);

// Image failover...
$image = Image::of('A donut on the counter')
    ->generate(provider: ['gemini', 'xai']);
</code-snippet>

### Testing

- Always fake AI operations in tests.
- Assert on prompts, generations, and operations.
- Prevent stray prompts to catch unexpected calls.

<code-snippet name="Testing Agents" lang="php">
use App\Ai\Agents\SalesCoach;
use Laravel\Ai\Prompts\AgentPrompt;

// Fake responses...
SalesCoach::fake();
SalesCoach::fake(['First response', 'Second response']);
SalesCoach::fake(fn (AgentPrompt $prompt) => 'Response: '.$prompt->prompt);

// Assertions...
SalesCoach::assertPrompted('Analyze this...');
SalesCoach::assertPrompted(fn (AgentPrompt $prompt) =>
    $prompt->contains('Analyze')
);
SalesCoach::assertNotPrompted('Missing prompt');
SalesCoach::assertNeverPrompted();

// Queued assertions...
SalesCoach::assertQueued('Analyze this...');
SalesCoach::assertNotQueued('Missing prompt');

// Prevent stray prompts...
SalesCoach::fake()->preventStrayPrompts();
</code-snippet>

<code-snippet name="Testing Images, Audio, and Transcriptions" lang="php">
use Laravel\Ai\{Image, Audio, Transcription};
use Laravel\Ai\Prompts\{ImagePrompt, AudioPrompt, TranscriptionPrompt};

// Fake images...
Image::fake();
Image::fake([base64_encode($image1), base64_encode($image2)]);
Image::assertGenerated(fn (ImagePrompt $prompt) =>
    $prompt->contains('sunset') && $prompt->isLandscape()
);

// Fake audio...
Audio::fake();
Audio::assertGenerated(fn (AudioPrompt $prompt) =>
    $prompt->contains('Hello') && $prompt->isFemale()
);

// Fake transcriptions...
Transcription::fake();
Transcription::fake(['First transcription', 'Second transcription']);
Transcription::assertGenerated(fn (TranscriptionPrompt $prompt) =>
    $prompt->language === 'en' && $prompt->isDiarized()
);
</code-snippet>

<code-snippet name="Testing Embeddings and Reranking" lang="php">
use Laravel\Ai\{Embeddings, Reranking};
use Laravel\Ai\Prompts\{EmbeddingsPrompt, RerankingPrompt};

// Fake embeddings...
Embeddings::fake();
Embeddings::fake([[$vector1], [$vector2]]);
Embeddings::assertGenerated(fn (EmbeddingsPrompt $prompt) =>
    $prompt->contains('Laravel') && $prompt->dimensions === 1536
);

// Fake reranking...
Reranking::fake();
Reranking::assertReranked(fn (RerankingPrompt $prompt) =>
    $prompt->contains('Laravel') && $prompt->limit === 5
);
</code-snippet>

<code-snippet name="Testing Files and Vector Stores" lang="php">
use Laravel\Ai\{Files, Stores};
use Laravel\Ai\Contracts\Files\StorableFile;
use Laravel\Ai\Files\Document;

// Fake files...
Files::fake();
Document::fromString('Hello, Laravel!', 'text/plain')->as('hello.txt')->put();
Files::assertStored(fn (StorableFile $file) =>
    (string) $file === 'Hello, Laravel!'
);
Files::assertDeleted('file-id');

// Fake stores...
Stores::fake();
$store = Stores::create('Knowledge Base');
Stores::assertCreated('Knowledge Base');
Stores::assertDeleted('store_id');

$store->add('file_id');
$store->assertAdded('file_id');
$store->remove('file_id');
$store->assertRemoved('file_id');
</code-snippet>

</laravel-boost-guidelines>
