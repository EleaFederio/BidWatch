<?php

namespace App\Http\Controllers;

use App\Models\Contract;
use App\Models\KanbanBoard;
use App\Models\KanbanCard;
use App\Models\KanbanColumn;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class KanbanController extends Controller
{
    private const DEFAULT_COLUMNS = [
        [
            'key' => 'backlog',
            'name' => 'Project Backlog',
            'description' => 'List all ongoing infrastructure works and gather candidate stories worth developing.',
            'position' => 1,
            'color' => 'from-slate-700 to-slate-500',
        ],
        [
            'key' => 'verification',
            'name' => 'Engineer Verification',
            'description' => 'Verify with the engineer or inspector that the story is accurate, current, and documented well enough to publish.',
            'position' => 2,
            'color' => 'from-sky-700 to-cyan-500',
        ],
        [
            'key' => 'filter',
            'name' => 'Selection Filter',
            'description' => 'Filter projects based on news value, urgency, and whether the public benefit is easy to explain.',
            'position' => 3,
            'color' => 'from-violet-700 to-fuchsia-500',
        ],
        [
            'key' => 'field',
            'name' => 'Field: Beneficiary Interview',
            'description' => 'Conduct on-site interviews and collect quotable reactions from users, commuters, or residents affected by the project.',
            'position' => 4,
            'color' => 'from-amber-600 to-orange-500',
        ],
        [
            'key' => 'assets',
            'name' => 'Drafting & PR Assets',
            'description' => 'Assemble final visuals, captions, and technical references for the news release, carousel, or PR package.',
            'position' => 5,
            'color' => 'from-emerald-700 to-lime-500',
        ],
    ];

    public function index(Request $request): Response
    {
        $board = $this->getOrCreateDefaultBoard($request->user()?->id);

        $contracts = Contract::query()
            ->select(['id', 'contract_id', 'title', 'location'])
            ->orderByDesc('id')
            ->get();

        return Inertia::render('Kanban', [
            'board' => $this->serializeBoard($board),
            'contracts' => $contracts,
        ]);
    }

    public function storeCard(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'contract_id' => ['required', 'exists:contracts,id'],
        ]);

        $board = $this->getOrCreateDefaultBoard($request->user()?->id);
        $backlogColumn = $board->columns()->orderBy('position')->first();

        abort_unless($backlogColumn, 500, 'Kanban backlog column not found.');

        $contract = Contract::query()->findOrFail($validated['contract_id']);

        $existingCard = KanbanCard::query()
            ->where('board_id', $board->id)
            ->where('contract_id', $contract->id)
            ->first();

        if ($existingCard) {
            return response()->json([
                'message' => 'This project is already on the Kanban board.',
                'board' => $this->serializeBoard($this->freshBoard($board->id)),
            ], 422);
        }

        $nextPosition = (int) KanbanCard::query()
            ->where('column_id', $backlogColumn->id)
            ->max('position') + 1;

        KanbanCard::query()->create([
            'board_id' => $board->id,
            'column_id' => $backlogColumn->id,
            'contract_id' => $contract->id,
            'title' => $contract->title,
            'description' => $contract->description,
            'position' => $nextPosition,
            'created_by' => $request->user()?->id,
        ]);

        return response()->json([
            'message' => 'Project added to backlog.',
            'board' => $this->serializeBoard($this->freshBoard($board->id)),
        ]);
    }

    public function storeColumn(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
        ]);

        $board = $this->getOrCreateDefaultBoard($request->user()?->id);

        $nextPosition = (int) KanbanColumn::query()
            ->where('board_id', $board->id)
            ->max('position') + 1;

        $column = $board->columns()->create([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'position' => $nextPosition,
            'color' => 'from-slate-700 to-slate-500',
        ]);

        return response()->json([
            'message' => 'Column added successfully.',
            'column_id' => $column->id,
            'board' => $this->serializeBoard($this->freshBoard($board->id)),
        ]);
    }

    public function updateColumn(Request $request, KanbanColumn $column): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
        ]);

        $board = $this->getOrCreateDefaultBoard($request->user()?->id);

        abort_unless($column->board_id === $board->id, 404);

        $column->update([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
        ]);

        return response()->json([
            'message' => 'Column updated successfully.',
            'board' => $this->serializeBoard($this->freshBoard($board->id)),
        ]);
    }

    public function moveCard(Request $request, KanbanCard $card): JsonResponse
    {
        $validated = $request->validate([
            'column_id' => ['required', 'exists:kanban_columns,id'],
        ]);

        $targetColumn = KanbanColumn::query()->findOrFail($validated['column_id']);

        abort_unless($targetColumn->board_id === $card->board_id, 422, 'Target column does not belong to the same board.');

        DB::transaction(function () use ($card, $targetColumn) {
            $nextPosition = (int) KanbanCard::query()
                ->where('column_id', $targetColumn->id)
                ->max('position') + 1;

            $card->update([
                'column_id' => $targetColumn->id,
                'position' => $nextPosition,
            ]);
        });

        return response()->json([
            'message' => 'Card moved successfully.',
            'board' => $this->serializeBoard($this->freshBoard($card->board_id)),
        ]);
    }

    public function destroyColumn(Request $request, KanbanColumn $column): JsonResponse
    {
        $board = $this->getOrCreateDefaultBoard($request->user()?->id);

        abort_unless($column->board_id === $board->id, 404);
        abort_if($column->name === 'Project Backlog', 422, 'Project Backlog cannot be deleted.');

        $backlogColumn = $board->columns()
            ->where('name', 'Project Backlog')
            ->first();

        abort_unless($backlogColumn, 500, 'Kanban backlog column not found.');

        DB::transaction(function () use ($column, $backlogColumn, $board) {
            $cards = $column->cards()->orderBy('position')->get();
            $backlogPosition = (int) KanbanCard::query()
                ->where('column_id', $backlogColumn->id)
                ->max('position');

            foreach ($cards as $index => $card) {
                $card->update([
                    'column_id' => $backlogColumn->id,
                    'position' => $backlogPosition + $index + 1,
                ]);
            }

            $deletedPosition = $column->position;
            $column->delete();

            KanbanColumn::query()
                ->where('board_id', $board->id)
                ->where('position', '>', $deletedPosition)
                ->decrement('position');
        });

        return response()->json([
            'message' => 'Column deleted successfully. Its cards were moved to Project Backlog.',
            'board' => $this->serializeBoard($this->freshBoard($board->id)),
        ]);
    }

    private function getOrCreateDefaultBoard(?int $userId): KanbanBoard
    {
        $board = KanbanBoard::query()
            ->where('is_default', true)
            ->with(['columns.cards.contract'])
            ->first();

        if ($board) {
            if ($userId) {
                $board->users()->syncWithoutDetaching([$userId => ['role' => 'editor']]);
            }

            return $board;
        }

        return DB::transaction(function () use ($userId) {
            $board = KanbanBoard::query()->create([
                'name' => 'Infrastructure reporting board',
                'description' => 'Default workflow for infrastructure reporting and PR preparation.',
                'created_by' => $userId,
                'is_default' => true,
            ]);

            foreach (self::DEFAULT_COLUMNS as $column) {
                $board->columns()->create([
                    'name' => $column['name'],
                    'description' => $column['description'],
                    'position' => $column['position'],
                    'color' => $column['color'],
                ]);
            }

            if ($userId) {
                $board->users()->syncWithoutDetaching([$userId => ['role' => 'editor']]);
            }

            return $this->freshBoard($board->id);
        });
    }

    private function freshBoard(int $boardId): KanbanBoard
    {
        return KanbanBoard::query()
            ->with([
                'columns' => fn ($query) => $query->orderBy('position'),
                'columns.cards' => fn ($query) => $query->with('contract')->orderBy('position'),
            ])
            ->findOrFail($boardId);
    }

    private function serializeBoard(KanbanBoard $board): array
    {
        return [
            'id' => $board->id,
            'name' => $board->name,
            'description' => $board->description,
            'columns' => $board->columns->map(function (KanbanColumn $column) {
                return [
                    'id' => $column->id,
                    'name' => $column->name,
                    'description' => $column->description,
                    'position' => $column->position,
                    'color' => $column->color,
                    'cards' => $column->cards->map(function (KanbanCard $card) {
                        return [
                            'id' => $card->id,
                            'title' => $card->title,
                            'meta' => $card->contract?->contract_id ?? 'Unlinked project',
                            'location' => $card->contract?->location ?? 'No location provided',
                            'contract_id' => $card->contract_id,
                        ];
                    })->values()->all(),
                ];
            })->values()->all(),
        ];
    }
}
