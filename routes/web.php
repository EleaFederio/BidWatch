<?php

use App\Http\Controllers\ContractController;
use App\Http\Controllers\KanbanController;
use App\Http\Controllers\PhotoController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SettingsController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');
Route::get('/calendar', function () {
    return Inertia::render('Calendar');
})->middleware(['auth', 'verified'])->name('calendar');
Route::get('/photos', [ContractController::class, 'photoManager'])->middleware(['auth', 'verified'])->name('photos');
Route::get('/kanban', [KanbanController::class, 'index'])->middleware(['auth', 'verified'])->name('kanban');
Route::post('/kanban/cards', [KanbanController::class, 'storeCard'])->middleware(['auth', 'verified'])->name('kanban.cards.store');
Route::post('/kanban/columns', [KanbanController::class, 'storeColumn'])->middleware(['auth', 'verified'])->name('kanban.columns.store');
Route::patch('/kanban/columns/{column}', [KanbanController::class, 'updateColumn'])->middleware(['auth', 'verified'])->name('kanban.columns.update');
Route::patch('/kanban/cards/{card}', [KanbanController::class, 'moveCard'])->middleware(['auth', 'verified'])->name('kanban.cards.move');
Route::delete('/kanban/columns/{column}', [KanbanController::class, 'destroyColumn'])->middleware(['auth', 'verified'])->name('kanban.columns.destroy');
Route::get('/map', function () {
    return Inertia::render('Map');
})->middleware(['auth', 'verified'])->name('map');
Route::get('/announcer', function () {
    return Inertia::render('Announcer');
})->middleware(['auth', 'verified'])->name('announcer');
Route::get('/contracts/{contractID}', [ContractController::class, 'details'])
    ->middleware(['auth', 'verified'])
    ->name('contracts.details');
Route::post('/contracts/{contract}/photos', [PhotoController::class, 'store'])
    ->middleware(['auth', 'verified'])
    ->name('contracts.photos.store');
Route::post('/photos/{photo}', [PhotoController::class, 'update'])
    ->middleware(['auth', 'verified'])
    ->name('photos.update');
Route::delete('/photos/{photo}', [PhotoController::class, 'destroy'])
    ->middleware(['auth', 'verified'])
    ->name('photos.destroy');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::middleware('auth')->group(function () {
    Route::get('/settings', [SettingsController::class, 'edit'])->name('settings.edit');
    Route::patch('/settings', [SettingsController::class, 'update'])->name('settings.update');
    Route::delete('/settings', [SettingsController::class, 'destroy'])->name('settings.destroy');
});

Route::get('/contract/certification/{contractID}', [ContractController::class, 'createCertification']);

require __DIR__.'/auth.php';
