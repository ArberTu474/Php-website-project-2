<?php

declare(strict_types=1);

namespace Controllers;

use Core\{Request, Response};
use Models\{Course, Enrollment, LessonProgress, Lesson};

class EnrollmentController
{
  // POST /courses/:id/enroll — student
  public function enroll(Request $req): void
  {
    $courseId = $req->params['id'];
    $studentId = $req->user['user_id'];

    // Course must exist and be published
    $course = Course::findById($courseId);
    if (!$course)
      Response::notFound('Course not found.');
    if (!$course['is_published'])
      Response::error('Course is not published.', 403);

    $enrollment = Enrollment::create($studentId, $courseId);

    // ON CONFLICT DO NOTHING returns no row — already enrolled
    if (!$enrollment)
      Response::error('You are already enrolled in this course.', 409);

    Response::success($enrollment, 201);
  }

  // POST /lessons/:id/complete — student
  public function complete(Request $req): void
  {
    $lessonId = $req->params['id'];
    $studentId = $req->user['user_id'];

    // Verify lesson exists
    $lesson = Lesson::findById($lessonId);
    if (!$lesson)
      Response::notFound('Lesson not found.');

    // Verify the student is enrolled in the course this lesson belongs to
    $enrollment = LessonProgress::findEnrollment($studentId, $lessonId);
    if (!$enrollment)
      Response::error('You are not enrolled in this course.', 403);

    // Mark lesson done (idempotent — duplicate silently ignored)
    LessonProgress::complete($enrollment['enrollment_id'], $lessonId);

    // Auto-complete enrollment if all lessons are done
    if (LessonProgress::allLessonsDone($enrollment['enrollment_id'])) {
      Enrollment::markCompleted($enrollment['enrollment_id']);
    }

    Response::success(['message' => 'Lesson marked as complete.']);
  }

  // GET /enrollments/me — student
  public function mine(Request $req): void
  {
    $enrollments = Enrollment::findByStudent($req->user['user_id']);
    Response::success($enrollments);
  }
}