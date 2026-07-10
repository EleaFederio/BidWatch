<?php

namespace App\Http\Controllers;

use App\Http\Resources\ContractListResource;
use App\Http\Resources\ContractsResource;
use App\Http\Resources\MonthlyContracts;
use App\Http\Resources\MonthlyOpeningOfBidsCollection;
use App\Http\Resources\MonthlyPreBidCollection;
use App\Models\Contract;
use App\Models\Photo;
use App\Models\ProjectStatus;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf as PDF;

class ContractController extends Controller
{
    /**
     * Display a listing of the resource.
     */

    public function index(Request $request)
    {
        $search = trim((string) $request->query('search', ''));

        $contracts = Contract::query()
            ->with('projectStatuses:id,status_name')
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($innerQuery) use ($search) {
                    $innerQuery->where('title', 'like', '%' . $search . '%')
                        ->orWhere('contract_id', 'like', '%' . $search . '%')
                        ->orWhere('location', 'like', '%' . $search . '%');
                });
            })
            ->orderBy('id', 'DESC')
            ->paginate(8)
            ->withQueryString();
        // return $contracts;
        return ContractsResource::collection($contracts);
    }

    public function bacSchedule(){
        $openingOfBids = DB::table('contracts')->whereDate('opening_of_bids', Carbon::today())->orderBy('opening_of_bids', 'DESC')->get();
        $preBidConference = DB::table('contracts')->whereDate('pre_bid', Carbon::today())->orderBy('pre_bid', 'DESC')->get();
        return response()->json([
            'success' => true,
            'opening_of_bids' => ContractsResource::collection($openingOfBids),
            'pre_bid_conference' => ContractsResource::collection($preBidConference)
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'contract_id' => 'required|unique:contracts,contract_id',
            'title' => 'required',
            'description' => 'nullable|string',
            'location' => 'nullable|string|max:200',
            'approved_budget' => 'required|regex:/^\d{5,15}(\.\d{1,2})?$/',
            'pre_bid' => 'nullable|date_format:Y-m-d H:i:s',
            'opening_of_bids' => 'required|date_format:Y-m-d H:i:s',
            'bulletin_posting' => 'required|date',
            'bulletin_removal' => 'required|date',
            'archieve' => 'required',
            'project_status_id' => 'nullable|integer|exists:project_status,id',
        ]);

        $statusLabel = $this->resolvePrimaryStatusLabel(
            $request->input('project_status_id'),
            $request->boolean('archieve')
        );

        $contract = Contract::create([
            ...$request->only([
                'contract_id',
                'title',
                'description',
                'location',
                'approved_budget',
                'pre_bid',
                'opening_of_bids',
                'bulletin_posting',
                'bulletin_removal',
                'archieve',
            ]),
            'status' => $statusLabel,
        ]);

        $this->syncProjectStatuses($contract, $request->input('project_status_id'));

        return response()->json([
            'success' => true,
            'message' => 'Contract Added!'
        ]);
    }

    public function importPdf(Request $request)
    {
        $request->validate([
            'pdf' => 'required|file|mimes:pdf|max:10240', // Max 10MB
        ]);

        $file = $request->file('pdf');
        $tempPath = $file->getRealPath();

        try {
            $apiKey = config('services.gemini.key');
            if (!$apiKey) {
                return response()->json([
                    'success' => false,
                    'message' => 'Gemini API Key is not configured. Please add GEMINI_API_KEY to your .env file.'
                ], 500);
            }
            $payload = [
                'contents' => [
                    [
                        'parts' => [
                            [
                                'text' => $this->geminiContractImportPrompt(),
                            ],
                            [
                                'inline_data' => [
                                    'mime_type' => $file->getClientMimeType() ?: $file->getMimeType() ?: 'application/pdf',
                                    'data' => base64_encode(file_get_contents($tempPath)),
                                ],
                            ],
                        ],
                    ],
                ],
                'generationConfig' => [
                    'responseMimeType' => 'application/json'
                ]
            ];

            $response = null;
            $usedModel = null;

            foreach ($this->geminiImportModels() as $model) {
                $usedModel = $model;
                $response = Http::timeout(120)
                    ->connectTimeout(15)
                    ->retry(2, 1000, null, false)
                    ->withHeaders([
                        'Content-Type' => 'application/json',
                    ])
                    ->post("https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}", $payload);

                if ($response->successful() || !$this->shouldTryNextGeminiModel($response->status())) {
                    break;
                }
            }

            if (!$response || !$response->successful()) {
                return response()->json([
                    'success' => false,
                    'message' => "Gemini API call failed using {$usedModel}: " . $this->sanitizeGeminiErrorMessage($response?->body() ?? 'No response received.')
                ], 500);
            }

            $result = $response->json();
            $jsonText = $result['candidates'][0]['content']['parts'][0]['text'] ?? '';
            $contractData = $this->decodeGeminiContractJson($jsonText);
            if ($contractData === null) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to parse JSON response from Gemini. Raw response: ' . trim($jsonText)
                ], 500);
            }

            // Ensure fallbacks for required database columns
            $contractId = trim($contractData['contract_id'] ?? '');
            if (empty($contractId)) {
                $contractId = 'GEN-' . strtoupper(\Illuminate\Support\Str::random(8));
            }

            // Uniqueness check for contract_id (append suffix if duplicate)
            $originalContractId = $contractId;
            $counter = 1;
            while (Contract::where('contract_id', $contractId)->exists()) {
                $contractId = $originalContractId . '-' . $counter;
                $counter++;
            }

            $title = trim($contractData['title'] ?? '');
            if (empty($title)) {
                $title = 'Imported Contract (' . $contractId . ')';
            }

            $approvedBudget = $contractData['approved_budget'] ?? 0.00;
            // Clean approved budget from commas/symbols if they survived
            if (is_string($approvedBudget)) {
                $approvedBudget = preg_replace('/[^\d.]/', '', $approvedBudget);
                $approvedBudget = (float) $approvedBudget;
            }

            // Date validation/fallback
            $openingOfBids = $contractData['opening_of_bids'] ?? null;
            if (empty($openingOfBids)) {
                // Since opening_of_bids is required by validation, fallback to 7 days from now if not found
                $openingOfBids = now()->addDays(7)->format('Y-m-d H:i:s');
            }

            $preBid = $contractData['pre_bid'] ?? null;
            if (empty($preBid)) {
                $preBid = null;
            }

            $bulletinPosting = $contractData['bulletin_posting'] ?? null;
            if (empty($bulletinPosting)) {
                $bulletinPosting = now()->format('Y-m-d');
            }

            $bulletinRemoval = $contractData['bulletin_removal'] ?? null;
            if (empty($bulletinRemoval)) {
                $bulletinRemoval = now()->addDays(14)->format('Y-m-d');
            }

            // Store the PDF file under public disk
            $filename = $contractId . '_' . time() . '.pdf';
            $pdfPath = $file->storeAs('contracts/pdfs', $filename, 'public');

            $statusLabel = $this->resolvePrimaryStatusLabel(null, false);

            $contract = Contract::create([
                'contract_id' => $contractId,
                'title' => $title,
                'description' => $contractData['description'] ?? null,
                'location' => $contractData['location'] ?? null,
                'approved_budget' => $approvedBudget,
                'pre_bid' => $preBid,
                'opening_of_bids' => $openingOfBids,
                'bulletin_posting' => $bulletinPosting,
                'bulletin_removal' => $bulletinRemoval,
                'archieve' => false,
                'status' => $statusLabel,
                'pdf_path' => $pdfPath,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Contract imported successfully!',
                'data' => $contract
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred during import: ' . $this->sanitizeGeminiErrorMessage($e->getMessage())
            ], 500);
        }
    }

    private function geminiContractImportPrompt(): string
    {
        return "Analyze the attached contract, invitation to bid, or bidding document PDF. " .
            "Extract the key fields and return a JSON object ONLY matching this schema:\n" .
            "{\n" .
            "  \"contract_id\": \"string (Unique code/identifier e.g. 23FL0000, 2026-BAC-01, etc. If not found, generate a unique code)\",\n" .
            "  \"title\": \"string (Title or name of the contract/project)\",\n" .
            "  \"description\": \"string (Short summary or description details of the project, nullable)\",\n" .
            "  \"location\": \"string (Location of the project, nullable)\",\n" .
            "  \"approved_budget\": \"float/decimal (Approved Budget for the Contract/ABC)\",\n" .
            "  \"pre_bid\": \"string (Pre-bid conference date & time in YYYY-MM-DD HH:mm:ss format, or null)\",\n" .
            "  \"opening_of_bids\": \"string (Opening of bids date & time in YYYY-MM-DD HH:mm:ss format, or null)\",\n" .
            "  \"bulletin_posting\": \"string (Bulletin posting date in YYYY-MM-DD format, or null)\",\n" .
            "  \"bulletin_removal\": \"string (Bulletin removal date in YYYY-MM-DD format, or null)\"\n" .
            "}\n\n" .
            "Requirements:\n" .
            "1. If a date is missing, return null for pre_bid or opening_of_bids.\n" .
            "2. Try to convert dates (e.g. 'October 24, 2026 at 10:00 AM') into YYYY-MM-DD HH:mm:ss.\n" .
            "3. approved_budget should be a clean number (e.g. 1500000.50). Remove any currency symbols or commas.\n" .
            "4. Use the document's procurement dates as written; do not infer current dates unless a field is absent.\n" .
            "5. Do not include markdown blocks like ```json ... ``` or any commentary. Return only the raw JSON string.";
    }

    private function geminiImportModels(): array
    {
        $models = array_merge(
            [config('services.gemini.model', 'gemini-flash-latest')],
            config('services.gemini.fallback_models', [])
        );

        return collect($models)
            ->map(fn ($model) => $this->normalizeGeminiModel((string) $model))
            ->filter()
            ->unique()
            ->values()
            ->all();
    }

    private function normalizeGeminiModel(string $model): string
    {
        $model = ltrim(trim($model), '/');

        return Str::startsWith($model, 'models/')
            ? Str::after($model, 'models/')
            : $model;
    }

    private function shouldTryNextGeminiModel(int $status): bool
    {
        return in_array($status, [404, 429, 500, 502, 503, 504], true);
    }

    private function decodeGeminiContractJson(string $jsonText): ?array
    {
        $jsonText = trim($jsonText);

        // Strip out markdown code blocks if Gemini ignored the instruction.
        if (str_starts_with($jsonText, '```')) {
            $jsonText = preg_replace('/^```(?:json)?\s*/i', '', $jsonText);
            $jsonText = preg_replace('/\s*```$/', '', $jsonText);
            $jsonText = trim($jsonText);
        }

        $contractData = json_decode($jsonText, true);
        if (json_last_error() === JSON_ERROR_NONE && is_array($contractData)) {
            return $contractData;
        }

        $jsonText = $this->extractFirstJsonObject($jsonText);
        if ($jsonText === null) {
            return null;
        }

        $contractData = json_decode($jsonText, true);

        return json_last_error() === JSON_ERROR_NONE && is_array($contractData)
            ? $contractData
            : null;
    }

    private function extractFirstJsonObject(string $text): ?string
    {
        $start = strpos($text, '{');
        if ($start === false) {
            return null;
        }

        $depth = 0;
        $inString = false;
        $escaped = false;
        $length = strlen($text);

        for ($index = $start; $index < $length; $index++) {
            $char = $text[$index];

            if ($inString) {
                if ($escaped) {
                    $escaped = false;
                    continue;
                }

                if ($char === '\\') {
                    $escaped = true;
                    continue;
                }

                if ($char === '"') {
                    $inString = false;
                }

                continue;
            }

            if ($char === '"') {
                $inString = true;
                continue;
            }

            if ($char === '{') {
                $depth++;
                continue;
            }

            if ($char === '}') {
                $depth--;

                if ($depth === 0) {
                    return substr($text, $start, $index - $start + 1);
                }
            }
        }

        if ($depth > 0 && !$inString) {
            return substr($text, $start) . str_repeat('}', $depth);
        }

        return null;
    }

    private function sanitizeGeminiErrorMessage(string $message): string
    {
        return preg_replace('/([?&]key=)[^&\s)]+/i', '$1[redacted]', $message);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $contract = Contract::find($id);
        if($contract){
            return response()->json([
                'success' => true,
                'message' => 'contract exist!',
                'data' => $contract
            ]);
        }
        return response()->json([
            'success' => false,
            'message' => 'Contract doesn\'t exist!'
        ]);
    }

    public function details($contractID)
    {
        $contract = Contract::with([
            'projectStatuses:id,status_name',
            'photos' => function ($query) {
                $query->orderByDesc('photo_date')->orderByDesc('photo_time');
            },
        ])->where('contract_id', $contractID)->firstOrFail();

        $contract->photos->transform(function ($photo) {
            $path = $photo->file_path;

            $photo->photo_url = Str::startsWith($path, ['http://', 'https://', '/'])
                ? $path
                : asset('storage/' . ltrim($path, '/'));

            return $photo;
        });

        return Inertia::render('ContractDetails', [
            'contract' => $contract,
            'availableStatuses' => ProjectStatus::query()
                ->select('id', 'status_name')
                ->orderBy('status_name')
                ->get(),
        ]);
    }

    public function photoManager(Request $request)
    {
        $sortBy = $request->query('sort_by', 'time');
        $sortOrder = $request->query('sort_order', 'desc');

        if (!in_array($sortBy, ['time', 'contract_id'], true)) {
            $sortBy = 'time';
        }

        if (!in_array($sortOrder, ['asc', 'desc'], true)) {
            $sortOrder = 'desc';
        }

        $contracts = Contract::query()
            ->whereHas('photos')
            ->with(['photos' => function ($query) {
                $query->orderByDesc('photo_date')->orderByDesc('photo_time');
            }])
            ->orderByDesc('id')
            ->paginate(6, ['*'], 'contracts_page')
            ->withQueryString();

        $contracts->getCollection()->transform(function ($contract) {
            $contract->photos->transform(function ($photo) {
                $path = $photo->file_path;

                $photo->photo_url = Str::startsWith($path, ['http://', 'https://', '/'])
                    ? $path
                    : asset('storage/' . ltrim($path, '/'));

                return $photo;
            });

            return $contract;
        });

        $photosQuery = Photo::query()
            ->select('photos.*')
            ->with(['contract:id,contract_id,title'])
            ->join('contracts', 'contracts.id', '=', 'photos.contract_id');

        if ($sortBy === 'contract_id') {
            $photosQuery
                ->orderBy('contracts.contract_id', $sortOrder)
                ->orderByDesc('photos.photo_date')
                ->orderByDesc('photos.photo_time')
                ->orderByDesc('photos.id');
        } else {
            $photosQuery
                ->orderBy('photos.photo_date', $sortOrder)
                ->orderBy('photos.photo_time', $sortOrder)
                ->orderBy('photos.id', $sortOrder);
        }

        $photos = $photosQuery
            ->paginate(6, ['photos.*'], 'photos_page')
            ->withQueryString();

        $photos->getCollection()->transform(function ($photo) {
            $path = $photo->file_path;

            $photo->photo_url = Str::startsWith($path, ['http://', 'https://', '/'])
                ? $path
                : asset('storage/' . ltrim($path, '/'));
            $photo->contract_code = $photo->contract?->contract_id;
            $photo->contract_title = $photo->contract?->title;

            return $photo;
        });

        $allPhotosQuery = Photo::query()
            ->select('photos.*')
            ->with(['contract:id,contract_id,title'])
            ->join('contracts', 'contracts.id', '=', 'photos.contract_id');

        if ($sortBy === 'contract_id') {
            $allPhotosQuery
                ->orderBy('contracts.contract_id', $sortOrder)
                ->orderByDesc('photos.photo_date')
                ->orderByDesc('photos.photo_time')
                ->orderByDesc('photos.id');
        } else {
            $allPhotosQuery
                ->orderBy('photos.photo_date', $sortOrder)
                ->orderBy('photos.photo_time', $sortOrder)
                ->orderBy('photos.id', $sortOrder);
        }

        $allPhotos = $allPhotosQuery->get();

        $allPhotos->transform(function ($photo) {
            $path = $photo->file_path;

            $photo->photo_url = Str::startsWith($path, ['http://', 'https://', '/'])
                ? $path
                : asset('storage/' . ltrim($path, '/'));
            $photo->contract_code = $photo->contract?->contract_id;
            $photo->contract_title = $photo->contract?->title;

            return $photo;
        });

        return Inertia::render('PhotoManager', [
            'contracts' => $contracts,
            'photos' => $photos,
            'allPhotos' => $allPhotos,
            'photoFilters' => [
                'sort_by' => $sortBy,
                'sort_order' => $sortOrder,
            ],
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $contract = Contract::find($id);
        if($contract){
            $request->validate([
                'contract_id' => 'required',
                'title' => 'required',
                'description' => 'nullable|string',
                'location' => 'nullable|string|max:200',
                'approved_budget' => 'required|regex:/^\d{5,15}(\.\d{1,2})?$/',
                'pre_bid' => 'nullable|date_format:Y-m-d H:i:s',
                'opening_of_bids' => 'required|date_format:Y-m-d H:i:s',
                'bulletin_posting' => 'required|date',
                'bulletin_removal' => 'required|date',
                'project_status_id' => 'nullable|integer|exists:project_status,id',
            ]);
            $statusLabel = $this->resolvePrimaryStatusLabel(
                $request->input('project_status_id'),
                $request->boolean('archieve')
            );
            $contract->contract_id = $request->contract_id;
            $contract->title = $request->title;
            $contract->description = $request->description;
            $contract->location = $request->location;
            $contract->approved_budget = $request->approved_budget;
            $contract->pre_bid = $request->pre_bid;
            $contract->opening_of_bids = $request->opening_of_bids;
            $contract->bulletin_posting = $request->bulletin_posting;
            $contract->bulletin_removal = $request->bulletin_removal;
            $contract->archieve = $request->archieve;
            $contract->status = $statusLabel;
            $contract->save();
            $this->syncProjectStatuses($contract, $request->input('project_status_id'));

            // response JSON
            return response()->json([
                'success' => true,
                'message' => 'Update Success!'
            ]);
        }
        return response()->json([
            'success' => false,
            'message' => 'Contract doesn\'t exist!'
        ]);
    }

    protected function resolvePrimaryStatusLabel($projectStatusId = null, bool $isArchived = false): string
    {
        $selectedStatus = ProjectStatus::query()
            ->whereKey($projectStatusId)
            ->value('status_name');

        if ($selectedStatus) {
            return $selectedStatus;
        }

        return $isArchived ? 'Archived' : 'Active';
    }

    protected function syncProjectStatuses(Contract $contract, $projectStatusId = null): void
    {
        $contract->projectStatuses()->sync(
            $projectStatusId ? [(int) $projectStatusId] : []
        );
    }

    public function threeMonthRecord(){
        $currentMonth = Carbon::create('2023-05-05')->month;
        $prebid = MonthlyPreBidCollection::collection(Contract::whereYear('pre_bid', date('Y'))->get());
        $openingOfBids = MonthlyOpeningOfBidsCollection::collection(Contract::whereYear('opening_of_bids', date('Y'))->get());

        $prebidCollection = new Collection($prebid);
        $openingOfBidsCollection = new Collection($openingOfBids);

        $scheduleObject = array_merge($openingOfBidsCollection->toArray(), $prebidCollection ->toArray());

        return $scheduleObject;
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $contract = Contract::find($id);
        if($contract){
            if($contract->delete()){
                return response()->json([
                    'success' => true,
                    'message' => 'Contract Deleted!'
                ]);
            }
            return response()->json([
                'success' => false,
                'message' => 'Contract Deletion fail!'
            ]);
        }
        return response()->json([
            'success' => false,
            'message' => 'Contract Doesn\'t Exist!'
        ]);
    }

    public function createCertification(Request $request, $contractID)
    {
        $contract = Contract::where('contract_id', $contractID)
            ->with([]) // add relationships if needed to avoid N+1
            ->first();

        if (!$contract) {
            return response()->json([
                'success' => false,
                'message' => 'Contract does not exist',
            ], 404);
        }

        // Prefer same-origin, secure path for client-side usage (front-end should use URL::route('contracts.certification', $contractID))
        if ($request->expectsJson()) {
            return response()->json(['url' => route('contracts.certification', $contractID)]);
        }

        $cacheKey = "contract_certification_pdf_{$contractID}";
        $storagePath = "public/certifications/{$contractID}_contract_certification.pdf";

        if (Cache::has($cacheKey) && Storage::exists($storagePath)) {
            return response()->file(storage_path("app/{$storagePath}"), [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => "inline; filename=\"{$contractID}_contract_certification.pdf\"",
            ]);
        }

        $pdf = PDF::loadView('pdf/posting_certification', [
            'title' => $contract->title,
            'contract_id' => $contract->contract_id,
            'bulletin_posting' => $contract->bulletin_posting,
            'bulletin_removal' => $contract->bulletin_removal,
        ]);

        // Dompdf options to pacify memory usage and allow remote logos.
        $pdf->setOption('isHtml5ParserEnabled', true);
        $pdf->setOption('isRemoteEnabled', true);
        $pdf->setOption('dpi', 96);
        $pdf->setOption('defaultFont', 'sans-serif');

        $pdf->setPaper('A4', 'portrait');
        $pdf->setOption('margin-top', '20mm');
        $pdf->setOption('margin-bottom', '20mm');
        $pdf->setOption('margin-left', '15mm');
        $pdf->setOption('margin-right', '15mm');

        // Ensure output directory exists and is writable.
        if (!Storage::exists('public/certifications')) {
            Storage::makeDirectory('public/certifications', 0755, true);
        }

        $pdfPath = storage_path("app/{$storagePath}");

        // Use save method when available; fallback to output so memory pressure is minimized in the response path.
        if (method_exists($pdf, 'save')) {
            $pdf->save($pdfPath);
        } else {
            Storage::put($storagePath, $pdf->output());
        }

        Cache::put($cacheKey, true, now()->addMinutes(30));

        return response()->file($pdfPath, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => "inline; filename=\"{$contractID}_contract_certification.pdf\"",
        ]);
    }
}
