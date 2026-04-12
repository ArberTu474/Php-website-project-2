<?php

declare(strict_types=1);

namespace Controllers;

use Core\{Request, Response};
use Models\{Course, Module};

class ModuleController
{
  // POST /courses/:id/modules — teacher (owner)
  public function store(Request $req): void
  {
    $courseId = $req->params['id'];
    $this->assertOwnership($courseId, $req->user['user_id']);

    $title = trim((string) $req->input('title', ''));
    if (empty($title))
      Response::error('Title is required.', 422);

    $module = Module::create([
      'course_id' => $courseId,
      'title' => $title,
      'description' => $req->input('description'),
      'order_index' => $req->input('order_index'),
    ]);

    Response::success($module, 201);
  }

  // PUT /modules/:id — teacher (owner)
  public function update(Request $req): void
  {
    $id = $req->params['id'];
    $this->assertModuleOwnership($id, $req->user['user_id']);

    $updated = Module::update($id, $req->only(['title', 'description', 'order_index']));
    if (!$updated)
      Response::notFound('Module not found.');
    Response::success($updated);
  }

  // DELETE /modules/:id — teacher (owner)
  public function destroy(Request $req): void
  {
    $id = $req->params['id'];
    $this->assertModuleOwnership($id, $req->user['user_id']);

    if (!Module::delete($id))
      Response::notFound('Module not found.');
    Response::json(['message' => 'Module deleted.']);
  }

  // ── Private ───────────────────────────────────────────────────────────────

  private function assertOwnership(string $courseId, string $userId): void
  {
    $course = Course::findById($courseId);
    if (!$course)
      Response::notFound('Course not found.');
    if ($course['teacher_id'] !== $userId)
      Response::forbidden();
  }

  private function assertModuleOwnership(string $moduleId, string $userId): void
  {
    $ownerId = Module::getCourseOwnerId($moduleId);
    if (!$ownerId)
      Response::notFound('Module not found.');
    if ($ownerId !== $userId)
      Response::forbidden();
  }
}