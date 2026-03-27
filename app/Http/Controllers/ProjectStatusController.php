<?php

namespace App\Http\Controllers;

use App\Models\ProjectStatus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProjectStatusController extends Controller
{
    protected function rules(ProjectStatus $projectStatus = null): array
    {
        $ignoreId = $projectStatus?->id;

        return [
            'status_name' => ['required', 'string', 'max:100', 'unique:project_status,status_name,' . $ignoreId],
        ];
    }

    public function index()
    {
        return ProjectStatus::query()
            ->leftJoin('contract_project_status', 'project_status.id', '=', 'contract_project_status.project_status_id')
            ->select('project_status.id', 'project_status.status_name', DB::raw('COUNT(contract_project_status.contract_id) as total'))
            ->groupBy('project_status.id', 'project_status.status_name')
            ->orderBy('project_status.status_name')
            ->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate($this->rules());
        $projectStatus = ProjectStatus::create($validated);

        return response()->json([
            'message' => 'Project status created successfully.',
            'data' => $projectStatus,
        ], 201);
    }

    public function show(ProjectStatus $projectStatus)
    {
        return response()->json([
            'data' => $projectStatus,
        ]);
    }

    public function update(Request $request, ProjectStatus $projectStatus)
    {
        $validated = $request->validate($this->rules($projectStatus));
        $projectStatus->update($validated);

        return response()->json([
            'message' => 'Project status updated successfully.',
            'data' => $projectStatus->fresh(),
        ]);
    }

    public function destroy(ProjectStatus $projectStatus)
    {
        $projectStatus->contracts()->detach();
        $projectStatus->delete();

        return response()->json([
            'message' => 'Project status deleted successfully.',
        ]);
    }
}
