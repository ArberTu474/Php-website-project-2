## Required Packages

- `php`
- `php-pgsql`
- `composer`

## Run

```bash
php -S localhost:8000 -t public
```

## How to use the `Database.php`

```php
use Core\Database;

$db = Database::connect();
$stmt = $db->prepare('SELECT * FROM users WHERE email = :email');
$stmt->execute([':email' => $email]);
$user = $stmt->fetch();
```

## How Controllers will look like

```php
Response::success($course);           // 200 with { "data": {...} }
Response::error('Title is required'); // 400 with { "error": "..." }
Response::notFound('Course not found'); // 404
Response::forbidden();                // 403
```

## Frontend packages

- `react-router-dom`
- `axios`
- `zustand`
- `@tanstack/react-query`
- `@uiw/react-md-editor`
- `react-markdown`

### Dev packages

- `tailwindcss`
- `@tailwindcss/vite`
- `prettier`
- `eslint`
- `@shadcn/ui`

## ShadCn componts

```bash
npx shadcn@latest add button input label card badge avatar
npx shadcn@latest add form select textarea dialog
npx shadcn@latest add dropdown-menu separator progress tabs
```

## Use the toast for notifications

```tsx
import { toast } from "sonner";

// Success
toast.success("Enrolled successfully!");

// Error
toast.error("Something went wrong.");

// Info
toast.info("Please complete 80% of the course to leave a review.");
```
