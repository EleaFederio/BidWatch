<?php

namespace App\Http\Controllers;

use App\Models\Contract;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeminiChatController extends Controller
{
    /**
     * Handle the chat requests with Gemini.
     */
    public function chat(Request $request)
    {
        $request->validate([
            'message' => 'required|string',
            'history' => 'nullable|array',
            'history.*.role' => 'required|string|in:user,model,assistant',
            'history.*.text' => 'required|string',
        ]);

        $apiKey = config('services.gemini.key');
        if (!$apiKey) {
            return response()->json([
                'success' => false,
                'message' => 'Gemini API Key is not configured. Please add GEMINI_API_KEY to your .env file.'
            ], 500);
        }

        // Get context from all contracts
        $contracts = Contract::all();
        $projectsContext = "";

        if ($contracts->isEmpty()) {
            $projectsContext = "No infrastructure projects have been added to the system yet.";
        } else {
            foreach ($contracts as $c) {
                $projectsContext .= sprintf(
                    "ID: %s | Title: %s | Location: %s | Budget: PHP %s | Pre-Bid: %s | Opening of Bids: %s | Bulletin: %s to %s | Status: %s\nDetails: %s\n---\n",
                    $c->contract_id,
                    $c->title,
                    $c->location ?? 'N/A',
                    number_format($c->approved_budget, 2),
                    $c->pre_bid ?? 'N/A',
                    $c->opening_of_bids ?? 'N/A',
                    $c->bulletin_posting ?? 'N/A',
                    $c->bulletin_removal ?? 'N/A',
                    $c->status ?? 'N/A',
                    $c->description ?? 'N/A'
                );
            }
        }

        // Format history and current message for Gemini API
        $contents = [];
        $history = $request->input('history', []);
        foreach ($history as $msg) {
            $contents[] = [
                'role' => ($msg['role'] === 'user') ? 'user' : 'model',
                'parts' => [
                    ['text' => $msg['text']]
                ]
            ];
        }

        // Append the new message
        $contents[] = [
            'role' => 'user',
            'parts' => [
                ['text' => $request->input('message')]
            ]
        ];

        $systemInstruction = "You are the BidWatch Assistant, a helpful AI specialist. Your job is to answer questions about the infrastructure projects (contracts) tracked in the system. Use the following project database to answer user queries accurately. Always format budgets with Peso symbol (₱) and format dates in a human-readable way. Respond in a friendly, conversational, and highly structured format with markdown tables, bolding, or lists where appropriate. If asked about a project not in the list, state that it is not tracked in the system.\n\nDatabase of Infrastructure Projects:\n" . $projectsContext;

        $payload = [
            'contents' => $contents,
            'systemInstruction' => [
                'parts' => [
                    [
                        'text' => $systemInstruction
                    ]
                ]
            ]
        ];

        $response = null;
        $usedModel = null;

        foreach ($this->geminiModels() as $model) {
            $usedModel = $model;
            try {
                $response = Http::timeout(60)
                    ->connectTimeout(10)
                    ->post("https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}", $payload);

                if ($response->successful()) {
                    break;
                }
            } catch (\Exception $e) {
                Log::error("Gemini API call failed with model {$model}: " . $e->getMessage());
            }
        }

        if (!$response || !$response->successful()) {
            $errorMsg = $response ? ($response->json('error.message') ?? $response->body()) : 'No response received.';
            return response()->json([
                'success' => false,
                'message' => "Gemini API call failed using {$usedModel}: " . $errorMsg
            ], 500);
        }

        $result = $response->json();
        $replyText = $result['candidates'][0]['content']['parts'][0]['text'] ?? '';

        return response()->json([
            'success' => true,
            'reply' => $replyText,
            'model' => $usedModel
        ]);
    }

    /**
     * Resolve the Gemini models to try.
     */
    private function geminiModels(): array
    {
        $primary = config('services.gemini.model', 'gemini-flash-latest');
        $fallbacks = config('services.gemini.fallback_models', []);

        $models = array_merge([$primary], $fallbacks);

        return array_values(array_filter(array_unique(array_map(function ($model) {
            $model = trim((string) $model);
            if (empty($model)) {
                return null;
            }
            // Strip v1beta/ or models/ prefix if present
            if (preg_match('/^models\/(.+)$/', $model, $matches)) {
                return $matches[1];
            }
            return $model;
        }, $models))));
    }
}
