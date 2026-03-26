<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class KanbanTemplateChecklistItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'template_card_id',
        'label',
        'position',
    ];

    public function card(): BelongsTo
    {
        return $this->belongsTo(KanbanTemplateCard::class, 'template_card_id');
    }
}
