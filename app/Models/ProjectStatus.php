<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class ProjectStatus extends Model
{
    use HasFactory;

    protected $table = 'project_status';

    protected $fillable = [
        'status_name',
    ];

    public function contracts(): BelongsToMany
    {
        return $this->belongsToMany(Contract::class, 'contract_project_status')
            ->withTimestamps();
    }
}
