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
        Schema::create('contracts', function (Blueprint $table) {
            $table->id();
            $table->string('contract_id');
            $table->longText('title');
            $table->longText('description')->nullable();
            $table->string('location')->nullable();
            $table->decimal('approved_budget', 15, 2);
            $table->dateTime('pre_bid')->nullable();
            $table->dateTime('opening_of_bids')->nullable();
            $table->date('bulletin_posting');
            $table->date('bulletin_removal');
            $table->boolean('archieve')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('contracts');
    }
};
