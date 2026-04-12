<?php

declare(strict_types=1);

namespace Core;

class Middleware
{
  public static function run(string $guard, Request $request): void
  {
    match ($guard) {
      'auth' => self::verifyToken($request),
      'teacher' => self::requireRole($request, 'teacher'),
      'student' => self::requireRole($request, 'student'),
      default => null,
    };
  }

  // ── Guards ────────────────────────────────────────────────────────────────

  private static function verifyToken(Request $request): void
  {
    $token = $request->bearerToken();
    if (!$token)
      Response::unauthorized('No token provided.');

    $payload = JWT::decode($token);
    if (!$payload)
      Response::unauthorized('Invalid or expired token.');

    // Inject decoded token data so controllers can access $req->user
    $request->user = $payload;
  }

  private static function requireRole(Request $request, string $role): void
  {
    // 'auth' must always run before a role guard
    if (!$request->user)
      Response::unauthorized();

    if ($request->user['role'] !== $role) {
      Response::forbidden("This action requires the {$role} role.");
    }
  }
}