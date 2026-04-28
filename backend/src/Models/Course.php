<?php

declare(strict_types=1);

namespace Models;

use Core\Database;

class Course
{
  // ── Queries ───────────────────────────────────────────────────────────────

  /** List all published courses with teacher name + category */
  public static function findAllPublished(): array
  {
    $db = Database::connect();
    $stmt = $db->query('
        SELECT
            c.course_id, c.title, c.slug, c.description,
            c.thumbnail_url, c.created_at,
            u.first_name || \' \' || u.last_name AS teacher_name,
            u.avatar_url                          AS teacher_avatar,
            cat.name                              AS category,
            COUNT(DISTINCT l.lesson_id)           AS total_lessons,
            ROUND(AVG(r.rating)::NUMERIC, 1)      AS avg_rating,
            COUNT(DISTINCT r.review_id)           AS total_reviews
        FROM   courses c
        JOIN   users u           ON u.user_id     = c.teacher_id
        LEFT JOIN categories cat ON cat.category_id = c.category_id
        LEFT JOIN modules m      ON m.course_id   = c.course_id
        LEFT JOIN lessons l      ON l.module_id   = m.module_id
        LEFT JOIN enrollments e  ON e.course_id   = c.course_id
        LEFT JOIN reviews r      ON r.enrollment_id = e.enrollment_id
        WHERE  c.is_published = TRUE
        GROUP BY c.course_id, u.first_name, u.last_name,
                 u.avatar_url, cat.name
        ORDER BY c.created_at DESC
    ');
    return $stmt->fetchAll();
  }

  public static function findByTeacher(string $teacherId): array
  {
    $db = Database::connect();
    $stmt = $db->prepare('
        SELECT
            c.*,
            cat.name                    AS category,
            COUNT(DISTINCT m.module_id) AS total_modules,
            COUNT(DISTINCT l.lesson_id) AS total_lessons,
            COUNT(DISTINCT e.enrollment_id) AS total_students
        FROM   courses c
        LEFT JOIN categories cat ON cat.category_id = c.category_id
        LEFT JOIN modules m      ON m.course_id  = c.course_id
        LEFT JOIN lessons l      ON l.module_id  = m.module_id
        LEFT JOIN enrollments e  ON e.course_id  = c.course_id
        WHERE  c.teacher_id = :teacher_id
        GROUP BY c.course_id, cat.name
        ORDER BY c.created_at DESC
    ');
    $stmt->execute([':teacher_id' => $teacherId]);
    return $stmt->fetchAll();
  }

  /** Full course detail: course + nested modules + lessons */
  public static function findBySlug(string $slug): ?array
  {
    $db = Database::connect();

    // 1. Fetch course + teacher name + category + avg rating
    $stmt = $db->prepare('
        SELECT
            c.*,
            CONCAT(u.first_name, \' \', u.last_name) AS teacher_name,
            cat.name                                  AS category,
            ROUND(AVG(r.rating), 1)                   AS avg_rating,
            COUNT(DISTINCT r.review_id)               AS total_reviews
        FROM   courses c
        JOIN   users u        ON u.user_id       = c.teacher_id
        LEFT JOIN categories cat ON cat.category_id = c.category_id
        LEFT JOIN enrollments e  ON e.course_id   = c.course_id
        LEFT JOIN reviews r      ON r.enrollment_id = e.enrollment_id
        WHERE  c.slug = :slug
        GROUP BY c.course_id, u.first_name, u.last_name, cat.name
    ');
    $stmt->execute([':slug' => $slug]);
    $course = $stmt->fetch();

    if (!$course)
      return null;

    // 2. Fetch modules
    $stmt2 = $db->prepare('
        SELECT * FROM modules
        WHERE  course_id = :course_id
        ORDER BY order_index ASC
    ');
    $stmt2->execute([':course_id' => $course['course_id']]);
    $modules = $stmt2->fetchAll();

    // 3. Fetch lessons for each module
    $stmt3 = $db->prepare('
        SELECT * FROM lessons
        WHERE  module_id = :module_id
        ORDER BY order_index ASC
    ');

    foreach ($modules as &$module) {
      $stmt3->execute([':module_id' => $module['module_id']]);
      $module['lessons'] = $stmt3->fetchAll();
    }

    $course['modules'] = $modules;

    // 4. Fetch reviews
    $stmt4 = $db->prepare('
        SELECT
            r.review_id,
            r.rating,
            r.comment,
            r.created_at,
            CONCAT(u.first_name, \' \', u.last_name) AS student_name
        FROM   reviews r
        JOIN   enrollments e ON e.enrollment_id = r.enrollment_id
        JOIN   users u       ON u.user_id = e.student_id
        WHERE  e.course_id = :course_id
        ORDER  BY r.created_at DESC
    ');
    $stmt4->execute([':course_id' => $course['course_id']]);
    $course['reviews'] = $stmt4->fetchAll();

    return $course;
  }

  public static function findById(string $id): ?array
  {
    $db = Database::connect();
    $stmt = $db->prepare('SELECT * FROM courses WHERE course_id = :id');
    $stmt->execute([':id' => $id]);
    return $stmt->fetch() ?: null;
  }

  public static function create(array $data): array
  {
    $db = Database::connect();
    $stmt = $db->prepare('
            INSERT INTO courses
                (teacher_id, category_id, title, slug, description, thumbnail_url, is_published)
            VALUES
                (:teacher_id, :category_id, :title, :slug, :description, :thumbnail_url, :is_published)
            RETURNING *
        ');
    $stmt->execute([
      ':teacher_id' => $data['teacher_id'],
      ':category_id' => $data['category_id'] ?? null,
      ':title' => $data['title'],
      ':slug' => $data['slug'],
      ':description' => $data['description'] ?? null,
      ':thumbnail_url' => $data['thumbnail_url'] ?? null,
      ':is_published' => $data['is_published'] ? 'true' : 'false',
    ]);
    return $stmt->fetch();
  }

  public static function update(string $id, array $data): ?array
  {
    $db = Database::connect();
    $stmt = $db->prepare('
            UPDATE courses SET
                title         = COALESCE(:title,         title),
                description   = COALESCE(:description,   description),
                thumbnail_url = COALESCE(:thumbnail_url, thumbnail_url),
                category_id   = COALESCE(:category_id,   category_id),
                is_published  = COALESCE(:is_published,  is_published),
                updated_at    = NOW()
            WHERE course_id = :id
            RETURNING *
        ');
    $stmt->execute([
      ':id' => $id,
      ':title' => $data['title'] ?? null,
      ':description' => $data['description'] ?? null,
      ':thumbnail_url' => $data['thumbnail_url'] ?? null,
      ':category_id' => $data['category_id'] ?? null,
      ':is_published' => isset($data['is_published'])
        ? ($data['is_published'] ? 'true' : 'false')
        : null,
    ]);
    return $stmt->fetch() ?: null;
  }

  public static function delete(string $id): bool
  {
    $db = Database::connect();
    $stmt = $db->prepare('DELETE FROM courses WHERE course_id = :id');
    $stmt->execute([':id' => $id]);
    return $stmt->rowCount() > 0;
  }

  public static function isOwnedBy(string $courseId, string $userId): bool
  {
    $db = Database::connect();
    $stmt = $db->prepare(
      'SELECT 1 FROM courses WHERE course_id = :id AND teacher_id = :uid'
    );
    $stmt->execute([':id' => $courseId, ':uid' => $userId]);
    return (bool) $stmt->fetch();
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  /** URL-safe slug from title + short unique suffix to avoid collisions */
  public static function makeSlug(string $title): string
  {
    $slug = strtolower(trim($title));
    $slug = preg_replace('/[^a-z0-9\s-]/', '', $slug);
    $slug = preg_replace('/[\s-]+/', '-', $slug);
    return trim($slug, '-') . '-' . substr(uniqid(), -6);
  }
}