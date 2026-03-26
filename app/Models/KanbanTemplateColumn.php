<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class KanbanTemplateColumn extends Model
{
    use HasFactory;

    protected $fillable = [
        'template_id',
        'name',
        'description',
        'position',
        'color',
    ];

    public function template(): BelongsTo
    {
        return $this->belongsTo(KanbanTemplate::class, 'template_id');
    }

    public function cards(): HasMany
    {
        return $this->hasMany(KanbanTemplateCard::class, 'template_column_id')->orderBy('position');
    }
}
