<?php

namespace App\Http\Controllers;

use App\Models\Officer;
use Illuminate\Http\Request;

class OfficerController extends Controller
{
    protected function rules(): array
    {
        return [
            'firstName' => ['required', 'string', 'max:100'],
            'middleName' => ['nullable', 'string', 'max:100'],
            'lastName' => ['required', 'string', 'max:100'],
            'designation' => ['required', 'string', 'max:150'],
            'position' => ['required', 'string', 'max:150'],
        ];
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Officer::query()->orderBy('lastName')->orderBy('firstName')->get();
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate($this->rules());
        $officer = Officer::create($validated);

        return response()->json([
            'message' => 'Officer created successfully.',
            'data' => $officer,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Officer $officer)
    {
        return response()->json([
            'data' => $officer,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Officer $officer)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Officer $officer)
    {
        $validated = $request->validate($this->rules());
        $officer->update($validated);

        return response()->json([
            'message' => 'Officer updated successfully.',
            'data' => $officer->fresh(),
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Officer $officer)
    {
        $officer->delete();

        return response()->json([
            'message' => 'Officer deleted successfully.',
        ]);
    }
}
