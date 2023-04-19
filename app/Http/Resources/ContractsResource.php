<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use NumberFormatter;

class ContractsResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        
        return [
            'id' => $this->id,
            'contract_id' => $this->contract_id,
            'title' => $this->title,
            'description' => $this->description,
            'location' => $this->location,
            'approved_budget' => '₱ '. number_format($this->approved_budget, 2, '.', ','),
            'pre_bid_schedule' => $this->pre_bid,
            'opening_of_bids_schedule' => $this->opening_of_bids,
            'bulletinboard_posting' => $this->bulletin_posting,
            'bulletinboard_removal' => $this->bulletin_removal,
            'archieve' => $this->archieve
        ];
    }

    public static $wrap;
}
