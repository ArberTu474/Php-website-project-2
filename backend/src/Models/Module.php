<?php

declare(strict_types=1);

namespace Models;

use Core\Database;

class Module
{
  public static function findById(string $id): ?array
  {
    $db = Database::connect();
    $stmt = $db->prepare('SELECT * FROM modules WHERE module_id = :id');
    $stmt->execute([':id' => $id]);
    return $stmt->fetch() ?: null;
  }

  public static function create(array $data): array
  {
    $db = Database::connect();

    // Auto-assign next order_index within the course
    $stmt = $db->prepare(
      'SELECT COALESCE(MAX(order_index), -1) + 1 AS next_index
             FROM modules WHERE course_id = :course_id'
    );
    $stmt->execute([':course_id' => $data['course_id']]);
    $nextIndex = (int) $stmt->fetchColumn();

    $stmt = $db->prepare('
            INSERT INTO modules (course_id, title, description, order_index)
            VALUES (:course_id, :title, :description, :order_index)
            RETURNING *
        ');
    $stmt->execute([
      ':course_id' => $data['course_id'],
      ':title' => $data['title'],
      ':description' => $data['description'] ?? null,
      ':order_index' => $data['order_index'] ?? $nextIndex,
    ]);
    return $stmt->fetch();
  }

  public static function update(string $id, array $data): ?array
  {
    $db = Database::connect();
    $stmt = $db->prepare('
            UPDATE modules SET
                title       = COALESCE(:title,       title),
                description = COALESCE(:description, description),
                order_index = COALESCE(:order_index, order_index),
                updated_at  = NOW()
            WHERE module_id = :id
            RETURNING *
        ');
    $stmt->execute([
      ':id' => $id,
      ':title' => $data['title'] ?? null,
      ':description' => $data['description'] ?? null,
      ':order_index' => $data['order_index'] ?? null,
    ]);
    return $stmt->fetch() ?: null;
  }

  public static function delete(string $id): bool
  {
    $db = Database::connect();
    $stmt = $db->prepare('DELETE FROM modules WHERE module_id = :id');
    $stmt->execute([':id' => $id]);
    return $stmt->rowCount() > 0;
  }

  /** Resolves ownership: module → course → teacher_id */
  public static function getCourseOwnerId(string $moduleId): ?string
  {
    $db = Database::connect();
    $stmt = $db->prepare('
            SELECT c.teacher_id
            FROM   modules m
            JOIN   courses c ON c.course_id = m.course_id
            WHERE  m.module_id = :id
        ');
    $stmt->execute([':id' => $moduleId]);
    $row = $stmt->fetch();
    return $row ? $row['teacher_id'] : null;
  }
}