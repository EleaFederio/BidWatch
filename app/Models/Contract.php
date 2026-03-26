<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Contract extends Model
{
    use HasFactory;

    protected $fillable = [
        'contract_id', 'title', 'description', 'location', 'approved_budget', 'pre_bid', 'opening_of_bids', 'bulletin_posting', 'bulletin_removal'
    ];

    public function photos(): HasMany
    {
        return $this->hasMany(Photo::class);
    }

    public function kanbanCards(): HasMany
    {
        return $this->hasMany(KanbanCard::class);
    }
}
