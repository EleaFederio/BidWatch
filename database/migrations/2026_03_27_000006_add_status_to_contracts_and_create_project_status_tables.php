<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('contracts', function (Blueprint $table) {
            $table->string('status')->nullable()->after('archieve');
        });

        Schema::create('project_status', function (Blueprint $table) {
            $table->id();
            $table->string('status_name')->unique();
            $table->timestamps();
        });

        Schema::create('contract_project_status', function (Blueprint $table) {
            $table->id();
            $table->foreignId('contract_id')->constrained()->cascadeOnDelete();
            $table->foreignId('project_status_id')->constrained('project_status')->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['contract_id', 'project_status_id']);
        });

        $timestamp = now();
        $defaultStatuses = ['Active', 'Archived', 'On Hold', 'Completed', 'Cancelled'];

        DB::table('project_status')->insert(
            collect($defaultStatuses)->map(fn ($statusName) => [
                'status_name' => $statusName,
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ])->all()
        );

        $statusMap = DB::table('project_status')->pluck('id', 'status_name');
        $pivotRows = [];

        DB::table('contracts')->select('id', 'archieve')->orderBy('id')->get()->each(function ($contract) use (&$pivotRows, $statusMap, $timestamp) {
            $statusName = $contract->archieve ? 'Archived' : 'Active';

            DB::table('contracts')
                ->where('id', $contract->id)
                ->update(['status' => $statusName]);

            if (isset($statusMap[$statusName])) {
                $pivotRows[] = [
                    'contract_id' => $contract->id,
                    'project_status_id' => $statusMap[$statusName],
                    'created_at' => $timestamp,
                    'updated_at' => $timestamp,
                ];
            }
        });

        if ($pivotRows !== []) {
            DB::table('contract_project_status')->insert($pivotRows);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('contract_project_status');
        Schema::dropIfExists('project_status');

        Schema::table('contracts', function (Blueprint $table) {
            $table->dropColumn('status');
        });
    }
};
