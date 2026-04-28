<?php

declare(strict_types=1);

$envFile = dirname(__DIR__) . '/.env';
if (file_exists($envFile)) {
    foreach (file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        if (str_starts_with(trim($line), '#') || !str_contains($line, '='))
            continue;
        [$key, $value] = explode('=', $line, 2);
        $_ENV[trim($key)] = trim(trim($value), "\"'");
    }
}

require_once dirname(__DIR__) . '/vendor/autoload.php';

header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

use Core\Router;
use Controllers\{
    AuthController,
    HealthController,
    CourseController,
    ModuleController,
    LessonController,
    EnrollmentController,
    ReviewController
};

$router = new Router();

// Health
$router->get('/health', [HealthController::class, 'check']);

// Auth
$router->post('/auth/register', [AuthController::class, 'register']);
$router->post('/auth/login', [AuthController::class, 'login']);
$router->get('/auth/me', [AuthController::class, 'me'], ['auth']);

// Courses
$router->get('/courses', [CourseController::class, 'index']);
$router->get('/courses/mine', [CourseController::class, 'mine'], ['auth', 'teacher']);
$router->get('/courses/:id', [CourseController::class, 'show']);
$router->post('/courses', [CourseController::class, 'store'], ['auth', 'teacher']);
$router->put('/courses/:id', [CourseController::class, 'update'], ['auth', 'teacher']);
$router->delete('/courses/:id', [CourseController::class, 'destroy'], ['auth', 'teacher']);

// Modules
$router->post('/courses/:id/modules', [ModuleController::class, 'store'], ['auth', 'teacher']);
$router->put('/modules/:id', [ModuleController::class, 'update'], ['auth', 'teacher']);
$router->delete('/modules/:id', [ModuleController::class, 'destroy'], ['auth', 'teacher']);

// Lessons
$router->post('/modules/:id/lessons', [LessonController::class, 'store'], ['auth', 'teacher']);
$router->get('/lessons/:id', [LessonController::class, 'show'], ['auth']);
$router->put('/lessons/:id', [LessonController::class, 'update'], ['auth', 'teacher']);

// Enrollments & Progress
// NOTE: /enrollments/me is registered BEFORE /enrollments/:id
// so the literal "me" is matched first and never treated as a UUID param
$router->get('/enrollments/me', [EnrollmentController::class, 'mine'], ['auth', 'student']);
$router->post('/courses/:id/enroll', [EnrollmentController::class, 'enroll'], ['auth', 'student']);
$router->post('/lessons/:id/complete', [EnrollmentController::class, 'complete'], ['auth', 'student']);

// Reviews
$router->post('/enrollments/:id/review', [ReviewController::class, 'store'], ['auth', 'student']);
$router->post('/enrollments/:id/review', [ReviewController::class, 'create'], ['auth', 'student']);

$router->dispatch();