<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class KanbanTemplateCard extends Model
{
    use HasFactory;

    protected $fillable = [
        'template_column_id',
        'title',
        'description',
        'position',
    ];

    public function column(): BelongsTo
    {
        return $this->belongsTo(KanbanTemplateColumn::class, 'template_column_id');
    }

    public function checklistItems(): HasMany
    {
        return $this->hasMany(KanbanTemplateChecklistItem::class, 'template_card_id')->orderBy('position');
    }
}
