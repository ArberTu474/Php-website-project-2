<?php

declare(strict_types=1);

namespace Core;

class Router
{
    private array $routes = [];

    // ── Route registration ────────────────────────────────────────────────────

    public function get(string $path, array $handler, array $middleware = []): void
    {
        $this->add('GET', $path, $handler, $middleware);
    }

    public function post(string $path, array $handler, array $middleware = []): void
    {
        $this->add('POST', $path, $handler, $middleware);
    }

    public function put(string $path, array $handler, array $middleware = []): void
    {
        $this->add('PUT', $path, $handler, $middleware);
    }

    public function delete(string $path, array $handler, array $middleware = []): void
    {
        $this->add('DELETE', $path, $handler, $middleware);
    }

    // ── Dispatch ──────────────────────────────────────────────────────────────

    public function dispatch(): void
    {
        $request = new Request();

        foreach ($this->routes as $route) {
            $params = $this->match($route['method'], $route['path'], $request);

            if ($params === null)
                continue; // no match — try next route

            // Inject wildcard params (e.g. :id) into the request object
            $request->params = $params;

            // Run middleware in order — any middleware can call Response::error()
            // and exit(), which stops execution before the controller is reached
            foreach ($route['middleware'] as $guard) {
                Middleware::run($guard, $request);
            }

            // Instantiate controller and call the method
            [$class, $method] = $route['handler'];
            (new $class())->$method($request);
            return;
        }

        // No route matched
        Response::notFound('Route not found');
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private function add(string $method, string $path, array $handler, array $middleware): void
    {
        $this->routes[] = compact('method', 'path', 'handler', 'middleware');
    }

    /**
     * Tries to match a registered route pattern against the real request.
     * Returns an array of extracted params on match, null on no match.
     *
     * Example: pattern "/courses/:id/modules" vs path "/courses/abc-123/modules"
     *          → returns ['id' => 'abc-123']
     */
    private function match(string $routeMethod, string $routePath, Request $request): ?array
    {
        if ($routeMethod !== $request->method)
            return null;

        // Convert :param wildcards into named capture groups
        // /courses/:id  →  #^/courses/(?P<id>[^/]+)$#
        $pattern = preg_replace('/\/:([a-zA-Z_]+)/', '/(?P<$1>[^/]+)', $routePath);
        $pattern = '#^' . $pattern . '$#';

        if (!preg_match($pattern, $request->path, $matches))
            return null;

        // Keep only the named captures (filter out numeric indexes)
        return array_filter($matches, fn($k) => !is_int($k), ARRAY_FILTER_USE_KEY);
    }
}