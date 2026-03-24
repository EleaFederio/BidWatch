<?php

namespace App\Http\Controllers;

use App\Models\Contract;
use App\Models\Photo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PhotoController extends Controller
{
    public function store(Request $request, Contract $contract): JsonResponse
    {
        $validated = $request->validate([
            'photos' => 'required|array|min:1',
            'photos.*' => 'required|image|max:51200',
            'photo_date' => 'required|date',
            'photo_time' => 'required|date_format:H:i',
            'location' => 'nullable|string|max:255',
            'longitude' => 'nullable|numeric|between:-180,180',
            'latitude' => 'nullable|numeric|between:-90,90',
        ], [
            'photos.*.max' => 'Each photo must be 50 MB or smaller.',
            'photos.*.image' => 'Each selected file must be an image.',
        ]);

        $photos = collect($validated['photos'])->map(function ($file) use ($validated, $contract) {
            $path = $file->store('photos/' . $contract->contract_id, 'public');

            return $this->transformPhoto($contract->photos()->create([
                'file_path' => $path,
                'photo_date' => $validated['photo_date'],
                'photo_time' => $validated['photo_time'],
                'location' => $validated['location'] ?? null,
                'longitude' => $validated['longitude'] ?? null,
                'latitude' => $validated['latitude'] ?? null,
            ]));
        })->values();

        return response()->json([
            'success' => true,
            'message' => 'Photo upload successful.',
            'data' => $photos,
        ], 201);
    }

    public function update(Request $request, Photo $photo): JsonResponse
    {
        $validated = $request->validate([
            'photo' => 'nullable|image|max:51200',
            'photo_date' => 'required|date',
            'photo_time' => 'required|date_format:H:i',
            'location' => 'nullable|string|max:255',
            'longitude' => 'nullable|numeric|between:-180,180',
            'latitude' => 'nullable|numeric|between:-90,90',
        ], [
            'photo.max' => 'The selected photo must be 50 MB or smaller.',
            'photo.image' => 'The selected file must be an image.',
        ]);

        if ($request->hasFile('photo')) {
            $this->deleteStoredFile($photo->file_path);
            $photo->file_path = $request->file('photo')->store('photos/' . $photo->contract->contract_id, 'public');
        }

        $photo->photo_date = $validated['photo_date'];
        $photo->photo_time = $validated['photo_time'];
        $photo->location = $validated['location'] ?? null;
        $photo->longitude = $validated['longitude'] ?? null;
        $photo->latitude = $validated['latitude'] ?? null;
        $photo->save();

        return response()->json([
            'success' => true,
            'message' => 'Photo updated successfully.',
            'data' => $this->transformPhoto($photo->fresh()),
        ]);
    }

    public function destroy(Photo $photo): JsonResponse
    {
        $this->deleteStoredFile($photo->file_path);
        $photo->delete();

        return response()->json([
            'success' => true,
            'message' => 'Photo deleted successfully.',
        ]);
    }

    private function deleteStoredFile(?string $path): void
    {
        if ($path && !Str::startsWith($path, ['http://', 'https://', '/']) && Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }

    private function transformPhoto(Photo $photo): array
    {
        $path = $photo->file_path;

        return [
            'id' => $photo->id,
            'contract_id' => $photo->contract_id,
            'file_path' => $photo->file_path,
            'photo_date' => $photo->photo_date,
            'photo_time' => $photo->photo_time,
            'location' => $photo->location,
            'longitude' => $photo->longitude,
            'latitude' => $photo->latitude,
            'created_at' => $photo->created_at,
            'updated_at' => $photo->updated_at,
            'photo_url' => Str::startsWith($path, ['http://', 'https://', '/'])
                ? $path
                : asset('storage/' . ltrim($path, '/')),
        ];
    }
}
