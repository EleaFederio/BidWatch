<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class KanbanTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'is_system',
    ];

    protected $casts = [
        'is_system' => 'boolean',
    ];

    public function columns(): HasMany
    {
        return $this->hasMany(KanbanTemplateColumn::class, 'template_id')->orderBy('position');
    }

    public function boards(): HasMany
    {
        return $this->hasMany(KanbanBoard::class, 'template_id');
    }
}
