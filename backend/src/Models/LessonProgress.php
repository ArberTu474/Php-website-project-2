<?php

declare(strict_types=1);

namespace Models;

use Core\Database;

class LessonProgress
{
  /**
   * Mark a lesson as complete for an enrollment.
   * Returns false if already marked (duplicate — do nothing).
   */
  public static function complete(string $enrollmentId, string $lessonId): bool
  {
    $db = Database::connect();
    $stmt = $db->prepare('
            INSERT INTO lesson_progress (enrollment_id, lesson_id)
            VALUES (:enrollment_id, :lesson_id)
            ON CONFLICT (enrollment_id, lesson_id) DO NOTHING
        ');
    $stmt->execute([
      ':enrollment_id' => $enrollmentId,
      ':lesson_id' => $lessonId,
    ]);
    return $stmt->rowCount() > 0;
  }

  /**
   * Finds the enrollment for a student + lesson combination.
   * Used to verify the student is enrolled before marking progress.
   */
  public static function findEnrollment(string $studentId, string $lessonId): ?array
  {
    $db = Database::connect();
    $stmt = $db->prepare('
            SELECT e.*
            FROM   enrollments e
            JOIN   courses  c ON c.course_id = e.course_id
            JOIN   modules  m ON m.course_id = c.course_id
            JOIN   lessons  l ON l.module_id = m.module_id
            WHERE  l.lesson_id  = :lesson_id
              AND  e.student_id = :student_id
        ');
    $stmt->execute([
      ':lesson_id' => $lessonId,
      ':student_id' => $studentId,
    ]);
    return $stmt->fetch() ?: null;
  }

  /**
   * Check if all lessons in the course are completed for this enrollment.
   * Used to auto-set completed_at on the enrollment.
   */
  public static function allLessonsDone(string $enrollmentId): bool
  {
    $db = Database::connect();
    $stmt = $db->prepare('
            SELECT
                COUNT(l.lesson_id)           AS total,
                COUNT(lp.progress_id)        AS completed
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

    if (!$row || (int) $row['total'] === 0)
      return false;
    return (int) $row['total'] === (int) $row['completed'];
  }
}