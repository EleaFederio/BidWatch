<?php

namespace App\Http\Controllers;

use App\Http\Resources\ContractListResource;
use App\Http\Resources\ContractsResource;
use App\Models\Contract;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use \PDF;

use function PHPUnit\Framework\isEmpty;

class ContractController extends Controller
{
    /**
     * Display a listing of the resource.
     */

    public function index()
    {
        $contracts = DB::table('contracts')->orderBy('id', 'DESC')->cursorPaginate(6);;
        // return $contracts;
        return ContractsResource::collection($contracts);
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
            'archieve' => 'required'
        ]);
        Contract::create($request->all());
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
                'bulletin_removal' => 'required|date'
            ]);
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
            $contract->save();

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

    public function createCertification($contractID){
        $contract = Contract::where('contract_id', $contractID)->first();
        if($contract == ''){
            return response()->json([
                'success' => false,
                'message' => 'Contract Doesn\'t Exist!'
            ]);
        }
        $pdf = PDF::loadView('pdf/posting_certification', $contract->toArray());
        $pdf->setPaper('A4', 'portrait');
        $pdf->setOption('margin: 50em 500em 300em 1em;');
        return $pdf->stream('pdf_file.pdf');
    }
}
