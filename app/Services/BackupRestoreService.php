<?php

namespace App\Services;

use App\Models\Backup;
use Illuminate\Support\Facades\Storage;
use Illuminate\Database\Eloquent\Model;
use ZipArchive;

class BackupRestoreService
{
    protected Backup $backup;
    protected array $data = [];
    protected int $recordsRestored = 0;

    public function __construct(Backup $backup)
    {
        $this->backup = $backup;
    }

    /**
     * Perform the restoration process.
     */
    public function restore(): bool
    {
        try {
            $this->backup->update(['restore_status' => 'processing']);

            // Extract backup data based on format
            match($this->backup->backup_format) {
                'json' => $this->extractFromJson(),
                'xml' => $this->extractFromXml(),
                'sql' => $this->extractFromSql(),
            };

            // Restore data to database
            $this->restoreData();

            $this->backup->update([
                'restore_status' => 'completed',
                'restore_record_count' => $this->recordsRestored,
                'restored_at' => now(),
            ]);

            return true;
        } catch (\Exception $e) {
            $this->backup->update([
                'restore_status' => 'failed',
                'restore_error_message' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Extract data from JSON backup file.
     */
    private function extractFromJson(): void
    {
        $path = storage_path("app/{$this->backup->file_path}");

        if (pathinfo($path, PATHINFO_EXTENSION) === 'zip') {
            $this->extractFromZip($path, 'json');
        } else {
            throw new \Exception('Invalid backup format');
        }
    }

    /**
     * Extract data from XML backup file.
     */
    private function extractFromXml(): void
    {
        $path = storage_path("app/{$this->backup->file_path}");

        if (pathinfo($path, PATHINFO_EXTENSION) === 'zip') {
            $this->extractFromZip($path, 'xml');
        } else {
            throw new \Exception('Invalid backup format');
        }
    }

    /**
     * Extract data from SQL backup file.
     */
    private function extractFromSql(): void
    {
        $path = storage_path("app/{$this->backup->file_path}");

        if (!file_exists($path)) {
            throw new \Exception('Backup file not found');
        }

        $sql = file_get_contents($path);
        $this->executeSqlStatements($sql);
    }

    /**
     * Extract files from ZIP archive.
     */
    private function extractFromZip(string $zipPath, string $format): void
    {
        $zip = new ZipArchive();
        $tempDir = storage_path('app/temp_restore_' . uniqid());
        mkdir($tempDir, 0755, true);

        try {
            if ($zip->open($zipPath) !== true) {
                throw new \Exception('Failed to open backup file');
            }

            $zip->extractTo($tempDir);
            $zip->close();

            // Parse extracted files
            if ($format === 'json') {
                $this->parseJsonFiles($tempDir);
            } elseif ($format === 'xml') {
                $this->parseXmlFile($tempDir);
            }

            $this->deleteDirectory($tempDir);
        } catch (\Exception $e) {
            $this->deleteDirectory($tempDir);
            throw $e;
        }
    }

    /**
     * Parse JSON files from extracted backup.
     */
    private function parseJsonFiles(string $tempDir): void
    {
        $files = scandir($tempDir);

        foreach ($files as $file) {
            if ($file === '.' || $file === '..' || $file === 'metadata.json') {
                continue;
            }

            if (pathinfo($file, PATHINFO_EXTENSION) === 'json') {
                $filePath = $tempDir . DIRECTORY_SEPARATOR . $file;
                $jsonData = json_decode(file_get_contents($filePath), true);

                $tableName = pathinfo($file, PATHINFO_FILENAME);
                $this->data[$tableName] = $jsonData ?? [];
            }
        }
    }

    /**
     * Parse XML file from extracted backup.
     */
    private function parseXmlFile(string $tempDir): void
    {
        $xmlFile = $tempDir . DIRECTORY_SEPARATOR . 'backup.xml';

        if (!file_exists($xmlFile)) {
            throw new \Exception('backup.xml not found in archive');
        }

        $xml = simplexml_load_file($xmlFile);

        foreach ($xml->children() as $tableElement) {
            $tableName = $tableElement->getName() . 's'; // pluralize
            $records = [];

            foreach ($tableElement->record as $recordElement) {
                $record = [];
                foreach ($recordElement->children() as $field) {
                    $record[$field->getName()] = (string)$field;
                }
                $records[] = $record;
            }

            $this->data[$tableName] = $records;
        }
    }

    /**
     * Execute SQL statements from backup.
     */
    private function executeSqlStatements(string $sql): void
    {
        // Split SQL into individual statements
        $statements = array_filter(
            array_map('trim', preg_split('/;[\n\r]+/', $sql)),
            fn($stmt) => !empty($stmt) && !str_starts_with(trim($stmt), '--')
        );

        foreach ($statements as $statement) {
            if (!empty(trim($statement))) {
                \DB::statement($statement);
                $this->recordsRestored++;
            }
        }
    }

    /**
     * Restore data to appropriate models.
     */
    private function restoreData(): void
    {
        $modelMap = [
            'contracts' => \App\Models\Contract::class,
            'kanban_boards' => \App\Models\KanbanBoard::class,
            'kanban_columns' => \App\Models\KanbanColumn::class,
            'kanban_cards' => \App\Models\KanbanCard::class,
            'kanban_checklist_items' => \App\Models\KanbanChecklistItem::class,
            'photos' => \App\Models\Photo::class,
            'announcements' => \App\Models\Announcement::class,
            'project_statuses' => \App\Models\ProjectStatus::class,
            'officers' => \App\Models\Officer::class,
        ];

        foreach ($this->data as $tableName => $records) {
            if (!isset($modelMap[$tableName])) {
                continue;
            }

            $modelClass = $modelMap[$tableName];

            foreach ($records as $record) {
                try {
                    // Filter out timestamps if creating new records
                    $attributes = array_diff_key(
                        $record,
                        array_flip(['id', 'created_at', 'updated_at'])
                    );

                    // Use updateOrCreate to handle existing records
                    $model = $modelClass::updateOrCreate(
                        ['id' => $record['id'] ?? null],
                        $attributes
                    );

                    $this->recordsRestored++;
                } catch (\Exception $e) {
                    // Log individual record errors but continue
                    \Log::warning("Failed to restore {$tableName} record", [
                        'record' => $record,
                        'error' => $e->getMessage(),
                    ]);
                }
            }
        }
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
}
