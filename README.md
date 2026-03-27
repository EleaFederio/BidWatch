# InfraBidWatch

BidWatch is a Laravel + Inertia.js web application designed for the Public Information Office and the Engineering Office. It helps monitor procurement contracts and project activities, organize infrastructure reporting, and support decision-making on which project is the best candidate to be reported as news.

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
- Kanban board with draggable cards and customizable columns
- Card customization with multiple labels, notes, and checklist items
- Card delete confirmation and quick project navigation from kanban cards
- Near real-time kanban board sync for logged-in users
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
- `/kanban` - infrastructure reporting kanban board
- `/map` - infrastructure map
- `/announcer` - announcement and text-to-speech page

## Kanban Board

The kanban board is designed for the Public Information Office and Engineering Office workflow, helping teams monitor project progress and decide which project is the strongest candidate for public reporting or news coverage. It currently supports:

- adding projects from the contract list into the backlog
- dragging cards across workflow columns
- adding, updating, and deleting custom columns
- customizing cards with multiple colored labels
- adding notes and checklist items to cards
- deleting cards with confirmation
- opening the related contract details page from a card
- automatic board refresh for other logged-in users after card movement and other board updates

If you are pulling the latest changes, make sure all kanban migrations are applied:

```bash
php artisan migrate
```

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
- Kanban UI is primarily in [`resources/js/Pages/Kanban.jsx`](resources/js/Pages/Kanban.jsx)
- Kanban modal components are in [`resources/js/components/kanban`](resources/js/components/kanban)
- Shared authenticated layout is in [`resources/js/Layouts/AuthenticatedLayout.jsx`](resources/js/Layouts/AuthenticatedLayout.jsx)
- Contract and photo logic is handled in:
  - [`app/Http/Controllers/ContractController.php`](app/Http/Controllers/ContractController.php)
  - [`app/Http/Controllers/PhotoController.php`](app/Http/Controllers/PhotoController.php)
- Kanban backend logic is handled in [`app/Http/Controllers/KanbanController.php`](app/Http/Controllers/KanbanController.php)

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
