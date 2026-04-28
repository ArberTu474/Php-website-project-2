<?php

declare(strict_types=1);

namespace Models;

use Core\Database;

class Lesson
{
  public static function findById(string $id): ?array
  {
    $db = Database::connect();
    $stmt = $db->prepare('SELECT * FROM lessons WHERE lesson_id = :id');
    $stmt->execute([':id' => $id]);
    return $stmt->fetch() ?: null;
  }

  public static function create(array $data): array
  {
    $db = Database::connect();

    // Auto-assign next order_index within the module
    $stmt = $db->prepare(
      'SELECT COALESCE(MAX(order_index), -1) + 1 AS next_index
             FROM lessons WHERE module_id = :module_id'
    );
    $stmt->execute([':module_id' => $data['module_id']]);
    $nextIndex = (int) $stmt->fetchColumn();

    $stmt = $db->prepare('
            INSERT INTO lessons
                (module_id, title, content, video_url, order_index, duration_mins)
            VALUES
                (:module_id, :title, :content, :video_url, :order_index, :duration_mins)
            RETURNING *
        ');
    $stmt->execute([
      ':module_id' => $data['module_id'],
      ':title' => $data['title'],
      ':content' => $data['content'] ?? null,
      ':video_url' => $data['video_url'] ?? null,
      ':order_index' => $data['order_index'] ?? $nextIndex,
      ':duration_mins' => $data['duration_mins'] ?? null,
    ]);
    return $stmt->fetch();
  }

  public static function update(string $id, array $data): ?array
  {
    $db = Database::connect();
    $stmt = $db->prepare('
            UPDATE lessons SET
                title         = COALESCE(:title,         title),
                content       = COALESCE(:content,       content),
                video_url     = COALESCE(:video_url,     video_url),
                order_index   = COALESCE(:order_index,   order_index),
                duration_mins = COALESCE(:duration_mins, duration_mins),
                updated_at    = NOW()
            WHERE lesson_id = :id
            RETURNING *
        ');
    $stmt->execute([
      ':id' => $id,
      ':title' => $data['title'] ?? null,
      ':content' => $data['content'] ?? null,
      ':video_url' => $data['video_url'] ?? null,
      ':order_index' => $data['order_index'] ?? null,
      ':duration_mins' => $data['duration_mins'] ?? null,
    ]);
    return $stmt->fetch() ?: null;
  }

  /** Resolves ownership: lesson → module → course → teacher_id */
  public static function getCourseOwnerId(string $lessonId): ?string
  {
    $db = Database::connect();
    $stmt = $db->prepare('
            SELECT c.teacher_id
            FROM   lessons l
            JOIN   modules m  ON m.module_id  = l.module_id
            JOIN   courses c  ON c.course_id  = m.course_id
            WHERE  l.lesson_id = :id
        ');
    $stmt->execute([':id' => $lessonId]);
    $row = $stmt->fetch();
    return $row ? $row['teacher_id'] : null;
  }
}