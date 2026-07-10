<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

class ContractImportTest extends TestCase
{
    use RefreshDatabase;

    public function test_import_pdf_endpoint_requires_file(): void
    {
        $response = $this->postJson('/api/contracts/import-pdf');

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['pdf']);
    }

    public function test_import_pdf_endpoint_requires_pdf_mimetype(): void
    {
        $file = UploadedFile::fake()->create('document.txt', 100, 'text/plain');

        $response = $this->postJson('/api/contracts/import-pdf', [
            'pdf' => $file,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['pdf']);
    }

    public function test_import_pdf_sends_pdf_bytes_to_gemini(): void
    {
        Config::set('services.gemini.key', 'test-api-key');
        Config::set('services.gemini.fallback_models', []);
        Storage::fake('public');

        Http::fake([
            'generativelanguage.googleapis.com/*' => Http::response([
                'candidates' => [
                    [
                        'content' => [
                            'parts' => [
                                [
                                    'text' => json_encode([
                                        'contract_id' => '25FL0067',
                                        'title' => 'Sample Road Project',
                                        'description' => 'Imported from PDF.',
                                        'location' => 'Sample Location',
                                        'approved_budget' => 1500000.50,
                                        'pre_bid' => null,
                                        'opening_of_bids' => '2026-07-20 10:00:00',
                                        'bulletin_posting' => '2026-07-10',
                                        'bulletin_removal' => '2026-07-17',
                                    ]) . "\n}",
                                ],
                            ],
                        ],
                    ],
                ],
            ], 200),
        ]);

        $file = UploadedFile::fake()->createWithContent(
            '25FL0067.pdf',
            "%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF"
        );

        $response = $this->postJson('/api/contracts/import-pdf', [
            'pdf' => $file,
        ]);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.contract_id', '25FL0067');

        $this->assertDatabaseHas('contracts', [
            'contract_id' => '25FL0067',
            'title' => 'Sample Road Project',
        ]);

        Http::assertSent(function ($request) {
            $parts = $request->data()['contents'][0]['parts'] ?? [];
            $inlineData = $parts[1]['inline_data'] ?? null;

            return $request->url() === 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=test-api-key'
                && ($parts[0]['text'] ?? '') !== ''
                && ($inlineData['mime_type'] ?? null) === 'application/pdf'
                && is_string($inlineData['data'] ?? null)
                && $inlineData['data'] !== '';
        });
    }

    public function test_import_pdf_tries_fallback_model_when_primary_is_overloaded(): void
    {
        Config::set('services.gemini.key', 'test-api-key');
        Config::set('services.gemini.model', 'gemini-flash-latest');
        Config::set('services.gemini.fallback_models', ['gemini-flash-lite-latest']);
        Storage::fake('public');

        Http::fake([
            '*/models/gemini-flash-latest:generateContent*' => Http::response([
                'error' => [
                    'code' => 503,
                    'message' => 'This model is currently experiencing high demand.',
                ],
            ], 503),
            '*/models/gemini-flash-lite-latest:generateContent*' => Http::response([
                'candidates' => [
                    [
                        'content' => [
                            'parts' => [
                                [
                                    'text' => json_encode([
                                        'contract_id' => '25FL0068',
                                        'title' => 'Fallback Road Project',
                                        'description' => null,
                                        'location' => 'Sample Location',
                                        'approved_budget' => 2500000,
                                        'pre_bid' => null,
                                        'opening_of_bids' => '2026-07-21 10:00:00',
                                        'bulletin_posting' => '2026-07-10',
                                        'bulletin_removal' => '2026-07-17',
                                    ]),
                                ],
                            ],
                        ],
                    ],
                ],
            ], 200),
        ]);

        $file = UploadedFile::fake()->createWithContent(
            '25FL0068.pdf',
            "%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF"
        );

        $response = $this->postJson('/api/contracts/import-pdf', [
            'pdf' => $file,
        ]);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.contract_id', '25FL0068');

        Http::assertSentCount(3);
        Http::assertSent(fn ($request) => str_contains($request->url(), '/models/gemini-flash-latest:generateContent'));
        Http::assertSent(fn ($request) => str_contains($request->url(), '/models/gemini-flash-lite-latest:generateContent'));
    }
}
