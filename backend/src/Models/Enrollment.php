<?php

declare(strict_types=1);

namespace Models;

use Core\Database;

class Enrollment
{
  public static function findById(string $id): ?array
  {
    $db = Database::connect();
    $stmt = $db->prepare('SELECT * FROM enrollments WHERE enrollment_id = :id');
    $stmt->execute([':id' => $id]);
    return $stmt->fetch() ?: null;
  }

  public static function findByStudentAndCourse(string $studentId, string $courseId): ?array
  {
    $db = Database::connect();
    $stmt = $db->prepare('
      SELECT * FROM enrollments
      WHERE student_id = :student_id AND course_id = :course_id
    ');
    $stmt->execute([
      ':student_id' => $studentId,
      ':course_id' => $courseId
    ]);
    return $stmt->fetch() ?: null;
  }

  /** Create enrollment — returns null if already enrolled (duplicate) */
  public static function create(string $studentId, string $courseId): ?array
  {
    $db = Database::connect();
    $stmt = $db->prepare('
      INSERT INTO enrollments (student_id, course_id)
      VALUES (:student_id, :course_id)
      ON CONFLICT (student_id, course_id) DO NOTHING
      RETURNING *
    ');
    $stmt->execute([
      ':student_id' => $studentId,
      ':course_id' => $courseId
    ]);
    return $stmt->fetch() ?: null;
  }

  /** All enrollments for a student with course info + live progress */
  public static function findByStudent(string $studentId): array
  {
    $db = Database::connect();
    $stmt = $db->prepare('
      SELECT
        e.enrollment_id,
        e.enrolled_at,
        e.completed_at,
        c.course_id,
        c.title AS course_title,
        c.slug AS course_slug,
        c.thumbnail_url,
        c.description AS course_description,
        u.first_name || \' \' || u.last_name AS teacher_name,
        COUNT(DISTINCT l.lesson_id) AS total_lessons,
        COUNT(DISTINCT lp.lesson_id) AS completed_lessons
      FROM enrollments e
      JOIN courses c ON c.course_id = e.course_id
      JOIN users u ON u.user_id = c.teacher_id
      LEFT JOIN modules m ON m.course_id = c.course_id
      LEFT JOIN lessons l ON l.module_id = m.module_id
      LEFT JOIN lesson_progress lp
        ON lp.lesson_id = l.lesson_id
        AND lp.enrollment_id = e.enrollment_id
      WHERE e.student_id = :student_id
      GROUP BY
        e.enrollment_id,
        e.enrolled_at,
        e.completed_at,
        c.course_id,
        c.title,
        c.slug,
        c.thumbnail_url,
        c.description,
        u.first_name,
        u.last_name
      ORDER BY e.enrolled_at DESC
    ');
    $stmt->execute([':student_id' => $studentId]);
    $rows = $stmt->fetchAll();

    $progressStmt = $db->prepare('
      SELECT lesson_id
      FROM lesson_progress
      WHERE enrollment_id = :enrollment_id
    ');

    $nextLessonStmt = $db->prepare('
      SELECT l.lesson_id
      FROM lessons l
      JOIN modules m ON m.module_id = l.module_id
      JOIN courses c ON c.course_id = m.course_id
      LEFT JOIN lesson_progress lp
        ON lp.lesson_id = l.lesson_id
        AND lp.enrollment_id = :enrollment_id
      WHERE c.course_id = :course_id
        AND lp.lesson_id IS NULL
      ORDER BY m.module_id, l.lesson_id
      LIMIT 1
    ');

    return array_map(function (array $row) use ($progressStmt, $nextLessonStmt): array {
      $total = (int) $row['total_lessons'];
      $completed = (int) $row['completed_lessons'];
      $percent = $total > 0 ? round(($completed / $total) * 100, 1) : 0;

      $progressStmt->execute([':enrollment_id' => $row['enrollment_id']]);
      $completedLessonIds = array_map(
        'strval',
        $progressStmt->fetchAll(\PDO::FETCH_COLUMN)
      );

      $nextLessonStmt->execute([
        ':enrollment_id' => $row['enrollment_id'],
        ':course_id' => $row['course_id'],
      ]);
      $nextLessonId = $nextLessonStmt->fetchColumn() ?: null;

      return [
        'enrollment_id' => $row['enrollment_id'],
        'enrolled_at' => $row['enrolled_at'],
        'completed_at' => $row['completed_at'],
        'course' => [
          'course_id' => $row['course_id'],
          'title' => $row['course_title'],
          'slug' => $row['course_slug'],
          'thumbnail_url' => $row['thumbnail_url'],
          'description' => $row['course_description'],
          'teacher_name' => $row['teacher_name'],
        ],
        'progress' => [
          'total_lessons' => $total,
          'completed_lessons' => $completed,
          'percent' => $percent,
          'can_review' => $percent >= 80,
        ],
        'completed_lesson_ids' => $completedLessonIds,
        'next_lesson_id' => $nextLessonId,
      ];
    }, $rows);
  }

  /** Mark enrollment as completed (called when 100% lessons done) */
  public static function markCompleted(string $enrollmentId): void
  {
    $db = Database::connect();
    $stmt = $db->prepare('
      UPDATE enrollments
      SET completed_at = NOW()
      WHERE enrollment_id = :id AND completed_at IS NULL
    ');
    $stmt->execute([':id' => $enrollmentId]);
  }
}