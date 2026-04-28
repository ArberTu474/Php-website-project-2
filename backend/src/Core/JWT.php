<?php

declare(strict_types=1);

namespace Core;

use RuntimeException;

class JWT
{
  // ── Public API ────────────────────────────────────────────────────────────

  /**
   * Creates a signed JWT token from a payload array.
   * Automatically adds iat (issued at) and exp (expiry).
   */
  public static function encode(array $payload): string
  {
    $secret = $_ENV['JWT_SECRET'] ?? '';
    if (empty($secret))
      throw new RuntimeException('JWT_SECRET is not set.');

    $header = self::base64url(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));

    $payload['iat'] = time();
    $payload['exp'] = time() + ((int) ($_ENV['JWT_EXPIRY_HOURS'] ?? 24) * 3600);

    $payload = self::base64url(json_encode($payload));
    $signature = self::base64url(
      hash_hmac('sha256', "{$header}.{$payload}", $secret, binary: true)
    );

    return "{$header}.{$payload}.{$signature}";
  }

  /**
   * Decodes and VERIFIES a JWT token.
   * Returns the payload array on success, null on any failure
   * (bad signature, expired, malformed).
   */
  public static function decode(string $token): ?array
  {
    $parts = explode('.', $token);
    if (count($parts) !== 3)
      return null;

    [$header, $payload, $signature] = $parts;

    // Re-compute expected signature and compare with hash_equals
    // (constant-time comparison prevents timing attacks)
    $secret = $_ENV['JWT_SECRET'] ?? '';
    $expected = self::base64url(
      hash_hmac('sha256', "{$header}.{$payload}", $secret, binary: true)
    );

    if (!hash_equals($expected, $signature))
      return null;

    $data = json_decode(self::base64urldecode($payload), true);
    if (!is_array($data))
      return null;

    // Reject expired tokens
    if (isset($data['exp']) && $data['exp'] < time())
      return null;

    return $data;
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  private static function base64url(string $data): string
  {
    // Standard base64, then make URL-safe: replace +/ with -_ and strip =
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
  }

  private static function base64urldecode(string $data): string
  {
    return base64_decode(strtr($data, '-_', '+/'));
  }
}