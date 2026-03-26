<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    public function kanbanBoardsCreated(): HasMany
    {
        return $this->hasMany(KanbanBoard::class, 'created_by');
    }

    public function kanbanBoards(): BelongsToMany
    {
        return $this->belongsToMany(KanbanBoard::class, 'kanban_board_users', 'user_id', 'board_id')
            ->withPivot('role')
            ->withTimestamps();
    }

    public function assignedKanbanCards(): HasMany
    {
        return $this->hasMany(KanbanCard::class, 'assigned_to');
    }

    public function kanbanCardsCreated(): HasMany
    {
        return $this->hasMany(KanbanCard::class, 'created_by');
    }
}
