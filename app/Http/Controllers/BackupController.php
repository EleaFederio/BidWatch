<?php

namespace App\Http\Controllers;

use App\Models\Backup;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use ZipArchive;
use DateTime;

class BackupController extends Controller
{
    /**
     * Display the backup management page.
     */
    public function index(): Response
    {
        $backups = Backup::where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('Settings/Backup', [
            'backups' => $backups,
        ]);
    }

    /**
     * Create a new backup with optional date range.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'backup_type' => 'required|in:full,date_range,manual',
            'backup_format' => 'required|in:json,xml,sql',
            'start_date' => 'nullable|date|before_or_equal:end_date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        // Create backup record
        $backup = Backup::create([
            'user_id' => Auth::id(),
            'backup_type' => $validated['backup_type'],
            'backup_format' => $validated['backup_format'],
            'start_date' => $validated['start_date'] ?? null,
            'end_date' => $validated['end_date'] ?? null,
            'status' => 'pending',
        ]);

        // Dispatch backup job (optional - for async processing)
        // BackupJob::dispatch($backup);

        // For now, process synchronously
        $this->performBackup($backup);

        return redirect()->route('settings.backup')->with('message', 'Backup created successfully!');
    }

    /**
     * Perform the actual backup.
     */
    private function performBackup(Backup $backup): void
    {
        try {
            $backup->update(['status' => 'processing']);

            $backupData = $this->collectBackupData($backup);
            $filePath = $this->createBackupFile($backup, $backupData);

            $backup->update([
                'file_path' => $filePath,
                'file_size' => Storage::size($filePath),
                'record_count' => $this->countRecords($backupData),
                'status' => 'completed',
            ]);
        } catch (\Exception $e) {
            $backup->update([
                'status' => 'failed',
                'error_message' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Collect backup data based on date range or full.
     */
    private function collectBackupData(Backup $backup): array
    {
        $data = [];

        // Fetch contracts
        $contractsQuery = \App\Models\Contract::query();
        if ($backup->backup_type === 'date_range' && $backup->start_date && $backup->end_date) {
            $contractsQuery->whereBetween('created_at', [$backup->start_date, $backup->end_date]);
        }
        $data['contracts'] = $contractsQuery->get();

        // Fetch kanban boards
        $boardsQuery = \App\Models\KanbanBoard::query();
        if ($backup->backup_type === 'date_range' && $backup->start_date && $backup->end_date) {
            $boardsQuery->whereBetween('created_at', [$backup->start_date, $backup->end_date]);
        }
        $data['kanban_boards'] = $boardsQuery->get();

        // Fetch photos
        $photosQuery = \App\Models\Photo::query();
        if ($backup->backup_type === 'date_range' && $backup->start_date && $backup->end_date) {
            $photosQuery->whereBetween('created_at', [$backup->start_date, $backup->end_date]);
        }
        $data['photos'] = $photosQuery->get();

        // Fetch announcements
        $announcementsQuery = \App\Models\Announcement::query();
        if ($backup->backup_type === 'date_range' && $backup->start_date && $backup->end_date) {
            $announcementsQuery->whereBetween('created_at', [$backup->start_date, $backup->end_date]);
        }
        $data['announcements'] = $announcementsQuery->get();

        return $data;
    }

    /**
     * Create a backup file based on format (ZIP with JSON/XML/SQL data).
     */
    private function createBackupFile(Backup $backup, array $data): string
    {
        $timestamp = now()->format('Y-m-d_H-i-s');
        $extension = $backup->backup_format === 'sql' ? 'sql' : 'zip';
        $filename = "backup_{$timestamp}_{$backup->id}.{$extension}";
        $path = "backups/{$timestamp}_{$backup->id}";
        $fullPath = storage_path("app/private/{$path}");

        // Create directory if it doesn't exist
        if (!is_dir($fullPath)) {
            mkdir($fullPath, 0755, true);
        }

        // Export data based on format
        match($backup->backup_format) {
            'json' => $this->exportAsJson($data, $fullPath),
            'xml' => $this->exportAsXml($data, $fullPath),
            'sql' => $this->exportAsSql($data, $fullPath),
        };

        // Create metadata file
        $metadata = [
            'backup_id' => $backup->id,
            'backup_type' => $backup->backup_type,
            'backup_format' => $backup->backup_format,
            'start_date' => $backup->start_date,
            'end_date' => $backup->end_date,
            'created_at' => now(),
            'data_summary' => array_map(fn($v) => count($v), $data),
        ];
        file_put_contents("{$fullPath}/metadata.json", json_encode($metadata, JSON_PRETTY_PRINT));

        // For SQL format, return single file
        if ($backup->backup_format === 'sql') {
            $sqlFile = "{$fullPath}/backup.sql";
            $finalPath = storage_path("app/private/{$filename}");
            rename($sqlFile, $finalPath);
            $this->deleteDirectory($fullPath);
            return "private/{$filename}";
        }

        // Create ZIP archive for JSON and XML
        $zip = new ZipArchive();
        $zipPath = storage_path("app/private/{$filename}");

        if ($zip->open($zipPath, ZipArchive::CREATE) === true) {
            $this->addFilesToZip($zip, $fullPath, '');
            $zip->close();

            // Clean up extracted files
            $this->deleteDirectory($fullPath);

            return "private/{$filename}";
        }

        return "private/{$filename}";
    }

    /**
     * Export data as JSON files (one per table).
     */
    private function exportAsJson(array $data, string $fullPath): void
    {
        foreach ($data as $key => $records) {
            $jsonPath = "{$fullPath}/{$key}.json";
            file_put_contents($jsonPath, json_encode($records, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
        }
    }

    /**
     * Export data as XML format.
     */
    private function exportAsXml(array $data, string $fullPath): void
    {
        $xml = new \SimpleXMLElement('<?xml version="1.0" encoding="UTF-8"?><backup></backup>');

        foreach ($data as $tableName => $records) {
            $tableElement = $xml->addChild(rtrim($tableName, 's'));

            foreach ($records as $record) {
                $recordElement = $tableElement->addChild('record');
                $record = $record instanceof \Illuminate\Database\Eloquent\Model
                    ? $record->toArray()
                    : (array)$record;

                foreach ($record as $key => $value) {
                    $recordElement->addChild(str_replace(' ', '_', $key), htmlspecialchars((string)$value));
                }
            }
        }

        $xml->asXML("{$fullPath}/backup.xml");
    }

    /**
     * Export data as SQL INSERT statements.
     */
    private function exportAsSql(array $data, string $fullPath): void
    {
        $sql = "-- BidWatch Backup SQL Export\n";
        $sql .= "-- Generated: " . now()->format('Y-m-d H:i:s') . "\n\n";

        foreach ($data as $tableName => $records) {
            if (empty($records)) {
                continue;
            }

            // Singularize table name (remove trailing 's')
            $table = rtrim($tableName, 's');

            foreach ($records as $record) {
                $record = $record instanceof \Illuminate\Database\Eloquent\Model
                    ? $record->toArray()
                    : (array)$record;

                $columns = array_keys($record);
                $values = array_values($record);

                // Escape and format values
                $formattedValues = array_map(function($value) {
                    if ($value === null) {
                        return 'NULL';
                    }
                    if (is_bool($value)) {
                        return $value ? '1' : '0';
                    }
                    if (is_numeric($value) && !is_string($value)) {
                        return $value;
                    }
                    return "'" . addslashes($value) . "'";
                }, $values);

                $columnList = implode(', ', array_map(function($col) {
                    return "`{$col}`";
                }, $columns));

                $valueList = implode(', ', $formattedValues);

                $sql .= "INSERT INTO `{$table}` ({$columnList}) VALUES ({$valueList});\n";
            }

            $sql .= "\n";
        }

        file_put_contents("{$fullPath}/backup.sql", $sql);
    }

    /**
     * Recursively add files to ZIP archive.
     */
    private function addFilesToZip(ZipArchive $zip, string $folder, string $prefix): void
    {
        $files = scandir($folder);

        foreach ($files as $file) {
            if ($file === '.' || $file === '..') {
                continue;
            }

            $filePath = $folder . DIRECTORY_SEPARATOR . $file;
            $zipPath = $prefix . $file;

            if (is_file($filePath)) {
                $zip->addFile($filePath, $zipPath);
            }
        }
    }

    /**
     * Delete a backup file.
     */
    public function destroy(Backup $backup)
    {
        $this->authorize('delete', $backup);

        if ($backup->file_path && Storage::exists($backup->file_path)) {
            Storage::delete($backup->file_path);
        }

        $backup->delete();

        return redirect()->route('settings.backup')->with('message', 'Backup deleted successfully!');
    }

    /**
     * Download a backup file.
     */
    public function download(Backup $backup)
    {
        $this->authorize('view', $backup);

        if (!$backup->file_path || !Storage::exists($backup->file_path)) {
            return back()->with('error', 'Backup file not found.');
        }

        return Storage::download($backup->file_path);
    }

    /**
     * Count total records in backup data.
     */
    private function countRecords(array $data): int
    {
        $total = 0;
        foreach ($data as $records) {
            $total += count($records);
        }
        return $total;
    }

    /**
     * Delete directory recursively.
     */
    private function deleteDirectory(string $dir): bool
    {
        if (!is_dir($dir)) {
            return false;
        }

        $files = scandir($dir);
        foreach ($files as $file) {
            if ($file !== '.' && $file !== '..') {
                $path = $dir . DIRECTORY_SEPARATOR . $file;
                is_dir($path) ? $this->deleteDirectory($path) : unlink($path);
            }
        }

        return rmdir($dir);
    }

    /**
     * Display import backup form.
     */
    public function importForm(): Response
    {
        return Inertia::render('Settings/ImportBackup');
    }

    /**
     * Handle backup file import/upload.
     */
    public function import(Request $request)
    {
        $validated = $request->validate([
            'backup_file' => 'required|file|mimes:zip,sql|max:512000', // 500MB max
        ]);

        try {
            $file = $validated['backup_file'];
            $filename = time() . '_' . $file->getClientOriginalName();
            $path = $file->storeAs('backups/imports', $filename, 'private');

            // Determine backup format from file extension
            $extension = $file->getClientOriginalExtension();
            if ($extension === 'zip') {
                $format = $this->detectZipFormat($path);
            } else {
                $format = 'sql';
            }

            // Create backup record for the imported file
            $backup = Backup::create([
                'user_id' => Auth::id(),
                'file_path' => $path,
                'file_size' => Storage::size($path),
                'backup_type' => 'manual',
                'backup_format' => $format,
                'status' => 'completed',
                'restore_status' => 'pending',
            ]);

            return redirect()->route('settings.backup')
                ->with('message', 'Backup file imported successfully. You can now restore it.');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to import backup file: ' . $e->getMessage());
        }
    }

    /**
     * Detect backup format from ZIP contents.
     */
    private function detectZipFormat(string $path): string
    {
        $fullPath = storage_path("app/private/{$path}");
        $zip = new ZipArchive();

        if ($zip->open($fullPath) === true) {
            // Check for JSON files
            for ($i = 0; $i < $zip->numFiles; $i++) {
                $filename = $zip->getNameIndex($i);
                if (pathinfo($filename, PATHINFO_EXTENSION) === 'json') {
                    $zip->close();
                    return 'json';
                }
            }

            // Check for XML file
            if ($zip->locateName('backup.xml') !== false) {
                $zip->close();
                return 'xml';
            }

            $zip->close();
        }

        return 'json'; // Default to JSON
    }

    /**
     * Restore data from a backup file.
     */
    public function restore(Backup $backup)
    {
        $this->authorize('view', $backup);

        if (!$backup->file_path || !Storage::disk('private')->exists($backup->file_path)) {
            return back()->with('error', 'Backup file not found.');
        }

        try {
            $service = new \App\Services\BackupRestoreService($backup);
            $service->restore();

            return redirect()->route('settings.backup')
                ->with('message', "Backup restored successfully! {$backup->restore_record_count} records were restored.");
        } catch (\Exception $e) {
            return back()->with('error', 'Restore failed: ' . $e->getMessage());
        }
    }

    /**
     * Get restore status for a backup.
     */
    public function restoreStatus(Backup $backup)
    {
        $this->authorize('view', $backup);

        return response()->json([
            'id' => $backup->id,
            'restore_status' => $backup->restore_status,
            'restore_record_count' => $backup->restore_record_count,
            'restore_error_message' => $backup->restore_error_message,
            'restored_at' => $backup->restored_at,
        ]);
    }

    /**
     * Cancel ongoing restore operation.
     */
    public function cancelRestore(Backup $backup)
    {
        $this->authorize('view', $backup);

        if ($backup->restore_status === 'processing') {
            $backup->update([
                'restore_status' => 'failed',
                'restore_error_message' => 'Restore operation was cancelled by user',
            ]);
        }

        return redirect()->route('settings.backup')
            ->with('message', 'Restore operation cancelled.');
    }
}
