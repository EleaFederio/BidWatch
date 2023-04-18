<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Contract extends Model
{
    use HasFactory;

    protected $fillable = [
        'contract_id', 'title', 'description', 'location', 'approved_budget', 'pre_bid', 'opening_of_bids', 'bulletin_posting', 'bulletin_removal'
    ];
}
