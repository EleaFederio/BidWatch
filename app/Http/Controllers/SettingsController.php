<?php

namespace App\Http\Controllers;

use App\Models\ProjectStatus;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    public function edit(Request $request): Response
    {
        return Inertia::render('Settings/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
            'projectStatuses' => ProjectStatus::query()
                ->leftJoin('contract_project_status', 'project_status.id', '=', 'contract_project_status.project_status_id')
                ->select('project_status.id', 'project_status.status_name', DB::raw('COUNT(contract_project_status.contract_id) as total'))
                ->groupBy('project_status.id', 'project_status.status_name')
                ->orderBy('project_status.status_name')
                ->get(),
        ]);
    }
}
