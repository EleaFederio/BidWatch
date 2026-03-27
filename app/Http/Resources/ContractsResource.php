<?php

namespace App\Http\Resources;

use Carbon\Carbon;
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
            'bulletinboard_posting' => Carbon::createFromFormat('Y-m-d H:i:s',  $this->bulletin_posting.' 00:00:00')->format('F d, Y'),
            'bulletinboard_removal' => Carbon::createFromFormat('Y-m-d H:i:s',  $this->bulletin_removal.' 00:00:00')->format('F d, Y'),
            'archieve' => $this->archieve,
            'status' => $this->status,
            'current_project_status' => $this->whenLoaded('projectStatuses', fn () => optional($this->projectStatuses->first(), function ($projectStatus) {
                return [
                    'id' => $projectStatus->id,
                    'status_name' => $projectStatus->status_name,
                ];
            })),
            'project_statuses' => $this->whenLoaded('projectStatuses', fn () => $this->projectStatuses->map(fn ($projectStatus) => [
                'id' => $projectStatus->id,
                'status_name' => $projectStatus->status_name,
            ])->take(1)->values()),
        ];
    }

    public static $wrap;
}
