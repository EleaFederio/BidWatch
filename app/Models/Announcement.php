<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Announcement extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'message',
        'schedule',
        'archive',
    ];

    protected $casts = [
        'archive' => 'boolean',
        'schedule' => 'datetime',
    ];
}
