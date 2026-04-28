<?php

declare(strict_types=1);

namespace Models;

use Core\Database;

class User
{
  /**
   * Find a user by email — returns full row including password_hash.
   * Only use this in AuthController::login(). Strip hash before sending to client.
   */
  public static function findByEmail(string $email): ?array
  {
    $db = Database::connect();
    $stmt = $db->prepare('SELECT * FROM users WHERE email = :email LIMIT 1');
    $stmt->execute([':email' => $email]);
    return $stmt->fetch() ?: null;
  }

  /**
   * Find a user by ID — NEVER returns password_hash.
   * Safe to pass directly to Response::success().
   */
  public static function findById(string $id): ?array
  {
    $db = Database::connect();
    $stmt = $db->prepare('
            SELECT user_id, email, first_name, last_name, role,
                   avatar_url, bio, created_at
            FROM   users
            WHERE  user_id = :id
            LIMIT  1
        ');
    $stmt->execute([':id' => $id]);
    return $stmt->fetch() ?: null;
  }

  /**
   * Insert a new user row.
   * Returns the created user WITHOUT password_hash (uses RETURNING).
   */
  public static function create(array $data): array
  {
    $db = Database::connect();
    $stmt = $db->prepare('
            INSERT INTO users (email, password_hash, first_name, last_name, role)
            VALUES (:email, :password_hash, :first_name, :last_name, :role)
            RETURNING user_id, email, first_name, last_name, role, created_at
        ');
    $stmt->execute([
      ':email' => $data['email'],
      ':password_hash' => $data['password_hash'],
      ':first_name' => $data['first_name'],
      ':last_name' => $data['last_name'],
      ':role' => $data['role'],
    ]);
    return $stmt->fetch();
  }

  public static function emailExists(string $email): bool
  {
    $db = Database::connect();
    $stmt = $db->prepare('SELECT 1 FROM users WHERE email = :email');
    $stmt->execute([':email' => $email]);
    return (bool) $stmt->fetch();
  }
}