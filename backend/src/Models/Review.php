<?php

declare(strict_types=1);

namespace Models;

use Core\Database;

class Review
{
  public static function existsForEnrollment(string $enrollmentId): bool
  {
    $db = Database::connect();
    $stmt = $db->prepare(
      'SELECT 1 FROM reviews WHERE enrollment_id = :id'
    );
    $stmt->execute([':id' => $enrollmentId]);
    return (bool) $stmt->fetch();
  }

  public static function create(array $data): array
  {
    $db = Database::connect();
    $stmt = $db->prepare('
            INSERT INTO reviews (enrollment_id, rating, comment)
            VALUES (:enrollment_id, :rating, :comment)
            RETURNING *
        ');
    $stmt->execute([
      ':enrollment_id' => $data['enrollment_id'],
      ':rating' => $data['rating'],
      ':comment' => $data['comment'] ?? null,
    ]);
    return $stmt->fetch();
  }

  /** Get all reviews for a course with student name */
  public static function findByCourse(string $courseId): array
  {
    $db = Database::connect();
    $stmt = $db->prepare('
            SELECT
                r.review_id, r.rating, r.comment, r.created_at,
                u.first_name || \' \' || u.last_name AS student_name,
                u.avatar_url AS student_avatar
            FROM   reviews r
            JOIN   enrollments e ON e.enrollment_id = r.enrollment_id
            JOIN   users       u ON u.user_id        = e.student_id
            WHERE  e.course_id = :course_id
            ORDER BY r.created_at DESC
        ');
    $stmt->execute([':course_id' => $courseId]);
    return $stmt->fetchAll();
  }

  /** 80% completion check — returns true if student can review */
  public static function canReview(string $enrollmentId): bool
  {
    $db = Database::connect();
    $stmt = $db->prepare('
            SELECT
                COUNT(l.lesson_id)::FLOAT               AS total,
                COUNT(lp.progress_id)::FLOAT            AS completed
            FROM   enrollments e
            JOIN   courses  c  ON c.course_id  = e.course_id
            JOIN   modules  m  ON m.course_id  = c.course_id
            JOIN   lessons  l  ON l.module_id  = m.module_id
            LEFT JOIN lesson_progress lp
                   ON lp.lesson_id     = l.lesson_id
                  AND lp.enrollment_id = e.enrollment_id
            WHERE  e.enrollment_id = :id
        ');
    $stmt->execute([':id' => $enrollmentId]);
    $row = $stmt->fetch();

    if (!$row || (float) $row['total'] === 0.0)
      return false;
    return ((float) $row['completed'] / (float) $row['total']) >= 0.80;
  }

  public static function upsert(array $data): array
  {
    $db = Database::connect();
    $stmt = $db->prepare('
        INSERT INTO reviews (enrollment_id, rating, comment)
        VALUES (:enrollment_id, :rating, :comment)
        ON CONFLICT (enrollment_id) DO UPDATE
            SET rating     = EXCLUDED.rating,
                comment    = EXCLUDED.comment,
                updated_at = NOW()
        RETURNING *
    ');
    $stmt->execute($data);
    return $stmt->fetch();
  }
}