<?php

namespace App\Http\Resources;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Http\Resources\Json\ResourceCollection;

class MonthlyPreBidCollection extends JsonResource
{
    /**
     * Transform the resource collection into an array.
     *
     * @return array<int|string, mixed>
     */
    public function toArray(Request $request): array
    {
        return[
            'title' => $this->contract_id . ' - Pre-bid Conference',
            'startDate' => $this->pre_bid,
            'endDate' => Carbon::create($this->pre_bid)->addMinutes(30),
        ];
    }
}
