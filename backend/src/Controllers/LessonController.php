<?php

declare(strict_types=1);

namespace Controllers;

use Core\{Request, Response};
use Models\{Module, Lesson, LessonProgress};

class LessonController
{
  // POST /modules/:id/lessons — teacher (owner)
  public function store(Request $req): void
  {
    $moduleId = $req->params['id'];
    $this->assertOwnership($moduleId, $req->user['user_id']);

    $title = trim((string) $req->input('title', ''));
    if (empty($title))
      Response::error('Title is required.', 422);

    $lesson = Lesson::create([
      'module_id' => $moduleId,
      'title' => $title,
      'content' => $req->input('content'),       // markdown
      'video_url' => $req->input('video_url'),
      'order_index' => $req->input('order_index'),
      'duration_mins' => $req->input('duration_mins'),
    ]);

    Response::success($lesson, 201);
  }

  // PUT /lessons/:id — teacher (owner)
  public function update(Request $req): void
  {
    $id = $req->params['id'];
    $this->assertLessonOwnership($id, $req->user['user_id']);

    $updated = Lesson::update($id, $req->only([
      'title',
      'content',
      'video_url',
      'order_index',
      'duration_mins',
    ]));

    if (!$updated)
      Response::notFound('Lesson not found.');
    Response::success($updated);
  }

  // ── Private ───────────────────────────────────────────────────────────────

  private function assertOwnership(string $moduleId, string $userId): void
  {
    $ownerId = Module::getCourseOwnerId($moduleId);
    if (!$ownerId)
      Response::notFound('Module not found.');
    if ($ownerId !== $userId)
      Response::forbidden();
  }

  private function assertLessonOwnership(string $lessonId, string $userId): void
  {
    $ownerId = Lesson::getCourseOwnerId($lessonId);
    if (!$ownerId)
      Response::notFound('Lesson not found.');
    if ($ownerId !== $userId)
      Response::forbidden();
  }

  public function show(Request $req): void
  {
    $lessonId = $req->params['id'];
    $studentId = $req->user['user_id'];

    $lesson = Lesson::findById($lessonId);
    if (!$lesson)
      Response::notFound('Lesson not found.');

    // Verify student is enrolled in the course this lesson belongs to
    $enrollment = LessonProgress::findEnrollment($studentId, $lessonId);
    if (!$enrollment)
      Response::error('You are not enrolled in this course.', 403);

    Response::success($lesson);
  }
}