<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('backups', function (Blueprint $table) {
            $table->enum('restore_status', ['pending', 'processing', 'completed', 'failed'])->nullable()->after('status');
            $table->text('restore_error_message')->nullable()->after('restore_status');
            $table->unsignedInteger('restore_record_count')->default(0)->after('restore_error_message');
            $table->timestamp('restored_at')->nullable()->after('restore_record_count');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('backups', function (Blueprint $table) {
            $table->dropColumn(['restore_status', 'restore_error_message', 'restore_record_count', 'restored_at']);
        });
    }
};
