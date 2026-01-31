<?php

use App\Models\User;

describe('CheckoutController', function () {
    describe('checkEmail', function () {
        it('returns exists: false for non-existent email', function () {
            $response = $this->postJson('/api/checkout/check-email', [
                'email' => 'nonexistent@example.com',
            ]);

            $response->assertOk()
                ->assertJson(['exists' => false]);
        });

        it('returns exists: true for existing email', function () {
            $user = User::factory()->create(['email' => 'existing@example.com']);

            $response = $this->postJson('/api/checkout/check-email', [
                'email' => 'existing@example.com',
            ]);

            $response->assertOk()
                ->assertJson(['exists' => true]);
        });

        it('validates email format', function () {
            $response = $this->postJson('/api/checkout/check-email', [
                'email' => 'invalid-email',
            ]);

            $response->assertUnprocessable()
                ->assertJsonValidationErrors(['email']);
        });

        it('requires email field', function () {
            $response = $this->postJson('/api/checkout/check-email', []);

            $response->assertUnprocessable()
                ->assertJsonValidationErrors(['email']);
        });
    });

    describe('register', function () {
        it('creates a new user with valid data', function () {
            $response = $this->postJson('/api/checkout/register', [
                'first_name' => 'John',
                'last_name' => 'Doe',
                'email' => 'newuser@example.com',
                'password' => 'password123',
                'password_confirmation' => 'password123',
            ]);

            $response->assertCreated()
                ->assertJsonStructure([
                    'success',
                    'user' => ['id', 'name', 'email'],
                ]);

            $this->assertDatabaseHas('users', [
                'email' => 'newuser@example.com',
                'name' => 'John Doe',
            ]);

            $this->assertDatabaseHas('profiles', [
                'email' => 'newuser@example.com',
                'first_name' => 'John',
                'last_name' => 'Doe',
            ]);

            $this->assertDatabaseHas('user_roles', [
                'role' => 'client',
            ]);
        });

        it('requires all fields', function () {
            $response = $this->postJson('/api/checkout/register', []);

            $response->assertUnprocessable()
                ->assertJsonValidationErrors(['first_name', 'last_name', 'email', 'password']);
        });

        it('validates password confirmation', function () {
            $response = $this->postJson('/api/checkout/register', [
                'first_name' => 'John',
                'last_name' => 'Doe',
                'email' => 'newuser@example.com',
                'password' => 'password123',
                'password_confirmation' => 'different',
            ]);

            $response->assertUnprocessable()
                ->assertJsonValidationErrors(['password']);
        });

        it('prevents duplicate email registration', function () {
            User::factory()->create(['email' => 'existing@example.com']);

            $response = $this->postJson('/api/checkout/register', [
                'first_name' => 'John',
                'last_name' => 'Doe',
                'email' => 'existing@example.com',
                'password' => 'password123',
                'password_confirmation' => 'password123',
            ]);

            $response->assertUnprocessable()
                ->assertJsonValidationErrors(['email']);
        });

        it('logs in the user after registration', function () {
            $response = $this->postJson('/api/checkout/register', [
                'first_name' => 'John',
                'last_name' => 'Doe',
                'email' => 'newuser@example.com',
                'password' => 'password123',
                'password_confirmation' => 'password123',
            ]);

            $response->assertCreated();

            $this->assertAuthenticated();
        });
    });
});
