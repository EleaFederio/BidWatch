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
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf as PDF;

use function PHPUnit\Framework\isEmpty;

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
