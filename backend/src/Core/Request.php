<?php

declare(strict_types=1);

namespace Core;

class Request
{
    public readonly string $method;
    public readonly string $path;
    public readonly array $body;
    public readonly array $headers;
    public array $params = []; // populated by Router when :id wildcards match
    public ?array $user = null; // populated by AuthMiddleware after token validation

    public function __construct()
    {
        $this->method = $_SERVER['REQUEST_METHOD'];
        $this->path = '/' . trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/');
        $this->headers = $this->parseHeaders();
        $this->body = $this->parseBody();
    }

    // ── Typed body accessors ──────────────────────────────────────────────────

    public function input(string $key, mixed $default = null): mixed
    {
        return $this->body[$key] ?? $default;
    }

    public function only(array $keys): array
    {
        return array_intersect_key($this->body, array_flip($keys));
    }

    // ── Auth header helper ────────────────────────────────────────────────────

    public function bearerToken(): ?string
    {
        $auth = $this->headers['Authorization'] ?? $this->headers['authorization'] ?? '';
        if (str_starts_with($auth, 'Bearer ')) {
            return substr($auth, 7);
        }
        return null;
    }

    // ── Private parsers ───────────────────────────────────────────────────────

    private function parseBody(): array
    {
        $contentType = $this->headers['Content-Type'] ?? $this->headers['content-type'] ?? '';

        // JSON body (what React will send)
        if (str_contains($contentType, 'application/json')) {
            $raw = file_get_contents('php://input');
            return json_decode($raw, true) ?? [];
        }

        // Fallback: form-encoded
        return $_POST;
    }

    private function parseHeaders(): array
    {
        // getallheaders() works on Apache; this fallback covers nginx + CLI
        if (function_exists('getallheaders')) {
            return getallheaders() ?: [];
        }

        $headers = [];
        foreach ($_SERVER as $key => $value) {
            if (str_starts_with($key, 'HTTP_')) {
                $name = str_replace('_', '-', substr($key, 5));
                $headers[$name] = $value;
            }
        }
        return $headers;
    }
}