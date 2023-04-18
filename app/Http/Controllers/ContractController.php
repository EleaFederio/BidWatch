<?php

namespace App\Http\Controllers;

use App\Models\Contract;
use Illuminate\Http\Request;

class ContractController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $contracts = Contract::paginate();
        return $contracts;
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'contract_id' => 'required|unique:contracts,contract_id',
            'title' => 'required',
            'location' => 'required',
            'approved_budget' => 'required|regex:/^\d{5,15}(\.\d{1,2})?$/',
            'pre_bid' => 'date_format:Y-m-d H:i:s',
            'opening_of_bids' => 'required|date_format:Y-m-d H:i:s',
            'bulletin_posting' => 'required|date',
            'bulletin_removal' => 'required|date'
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
    public function show(Contract $contract)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Contract $contract)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Contract $contract)
    {
        //
    }
}
