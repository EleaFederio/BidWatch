<?php

namespace App\Http\Resources;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Http\Resources\Json\ResourceCollection;

class MonthlyContracts extends JsonResource
{
    /**
     * Transform the resource collection into an array.
     *
     * @return array<int|string, mixed>
     */
    public function toArray(Request $request): array
    {
        return[
            'title' => $this->contract_id,
            'startDate' => $this->opening_of_bids,
            'endDate' => Carbon::create($this->opening_of_bids)->addMinutes(30)
        ];
    }
}
