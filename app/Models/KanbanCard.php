<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class KanbanCard extends Model
{
    use HasFactory;

    protected $fillable = [
        'board_id',
        'column_id',
        'contract_id',
        'title',
        'label',
        'label_color',
        'labels',
        'description',
        'position',
        'assigned_to',
        'due_date',
        'created_by',
    ];

    protected $casts = [
        'due_date' => 'date',
        'labels' => 'array',
    ];

    public function board(): BelongsTo
    {
        return $this->belongsTo(KanbanBoard::class, 'board_id');
    }

    public function column(): BelongsTo
    {
        return $this->belongsTo(KanbanColumn::class, 'column_id');
    }

    public function contract(): BelongsTo
    {
        return $this->belongsTo(Contract::class, 'contract_id');
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function checklistItems(): HasMany
    {
        return $this->hasMany(KanbanChecklistItem::class, 'card_id')->orderBy('position');
    }
}
