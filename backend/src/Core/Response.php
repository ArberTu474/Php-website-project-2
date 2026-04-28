<?php

declare(strict_types=1);

namespace Core;

class Response
{
    /**
     * Send a JSON response and terminate execution.
     *
     * @param mixed $data    Anything json_encode() can handle
     * @param int   $status  HTTP status code (default 200)
     */
    public static function json(mixed $data, int $status = 200): never
    {
        http_response_code($status);
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    // ── Convenience shortcuts ─────────────────────────────────────────────────

    public static function success(mixed $data, int $status = 200): never
    {
        self::json(['data' => $data], $status);
    }

    public static function error(string $message, int $status = 400): never
    {
        self::json(['error' => $message], $status);
    }

    public static function notFound(string $message = 'Not found'): never
    {
        self::error($message, 404);
    }

    public static function unauthorized(string $message = 'Unauthorized'): never
    {
        self::error($message, 401);
    }

    public static function forbidden(string $message = 'Forbidden'): never
    {
        self::error($message, 403);
    }
}