# BidWatch

BidWatch is a Laravel + Inertia.js web application for tracking procurement contracts and project activities. It includes contract monitoring, schedules, project photo management, announcements, mapping, and supporting admin pages.

## Features

- Contract dashboard with card and list views
- Search contracts by title, contract ID, or location
- Contract details page
- Contract certification PDF generation
- Calendar view for bid-related schedules
- Project photo manager
- Per-contract photo upload, replace, and delete
- Infrastructure map page
- Announcer page with text-to-speech
- Kanban page route and navigation
- Authenticated app shell with fixed navbar and breadcrumbs

## Tech Stack

- Laravel 10
- PHP 8.1+
- Inertia.js
- React 18
- Vite
- Tailwind CSS
- Bootstrap / React Bootstrap
- Material Tailwind
- Leaflet / React Leaflet
- DevExpress Scheduler
- DomPDF

## Requirements

- PHP 8.1 or newer
- Composer
- Node.js and npm
- MySQL

## Installation

1. Clone the project.
2. Install PHP dependencies.
3. Install frontend dependencies.
4. Copy the environment file.
5. Generate the application key.
6. Configure your database in `.env`.
7. Run migrations.
8. Create the storage symlink.
9. Start the backend and frontend servers.

### Commands

```bash
composer install
npm install
copy .env.example .env
php artisan key:generate
php artisan migrate
php artisan storage:link
php artisan serve
npm run dev
```

If you are using PowerShell and `.env` already exists, skip the copy step.

## Main Pages

- `/dashboard` - contracts overview
- `/calendar` - bid schedule calendar
- `/photos` - project photo manager
- `/kanban` - kanban page
- `/map` - infrastructure map
- `/announcer` - announcement and text-to-speech page

## Contract Photos

Each contract can have multiple photos. A photo stores:

- file path
- date
- time
- location (nullable)
- longitude (nullable)
- latitude (nullable)

Photo files are stored on the `public` disk, so `php artisan storage:link` is required for browser access.

## API Notes

The app uses API routes for contract data and schedule data.

Examples already present in the project:

- `GET /api/contracts`
- `POST /api/contracts`
- `GET /api/contract_schedule/bidding`
- `GET /api/contract_schedule/month`

## Development Notes

- Frontend pages are located in [`resources/js/Pages`](resources/js/Pages)
- Shared authenticated layout is in [`resources/js/Layouts/AuthenticatedLayout.jsx`](resources/js/Layouts/AuthenticatedLayout.jsx)
- Contract and photo logic is handled in:
  - [`app/Http/Controllers/ContractController.php`](app/Http/Controllers/ContractController.php)
  - [`app/Http/Controllers/PhotoController.php`](app/Http/Controllers/PhotoController.php)

## Port Forward / HTTPS Note

If you need to expose the application through port forwarding and force HTTPS handling, you can add this in `AppServiceProvider.php`:

```php
public function boot(): void
{
    $this->app['request']->server->set('HTTPS', 'on');
}
```

You may also need to delete the `public/hot` file depending on your setup.

## Build for Production

```bash
npm run build
```

## License

This project currently does not define a custom project license in the repository.
