<?php

namespace App\Policies;

use App\Models\Backup;
use App\Models\User;

class BackupPolicy
{
    /**
     * Determine whether the user can view the backup.
     */
    public function view(User $user, Backup $backup): bool
    {
        return $user->id === $backup->user_id;
    }

    /**
     * Determine whether the user can delete the backup.
     */
    public function delete(User $user, Backup $backup): bool
    {
        return $user->id === $backup->user_id;
    }
}
