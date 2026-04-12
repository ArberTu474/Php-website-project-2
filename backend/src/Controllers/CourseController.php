<?php

declare(strict_types=1);

namespace Controllers;

use Core\{Request, Response};
use Models\Course;

class CourseController
{
  // GET /courses — public
  public function index(Request $req): void
  {
    Response::success(Course::findAllPublished());
  }

  // GET /courses/:id — public (used for course detail page)
  public function show(Request $req): void
  {
    $course = Course::findBySlug($req->params['id']);
    if (!$course)
      Response::notFound('Course not found.');
    Response::success($course);
  }

  // POST /courses — teacher only
  public function store(Request $req): void
  {
    $title = trim((string) $req->input('title', ''));
    if (empty($title))
      Response::error('Title is required.', 422);

    $course = Course::create([
      'teacher_id' => $req->user['user_id'],
      'category_id' => $req->input('category_id'),
      'title' => $title,
      'slug' => Course::makeSlug($title),
      'description' => $req->input('description'),
      'thumbnail_url' => $req->input('thumbnail_url'),
      'is_published' => (bool) $req->input('is_published', false),
    ]);

    Response::success($course, 201);
  }

  // PUT /courses/:id — teacher (owner)
  public function update(Request $req): void
  {
    $id = $req->params['id'];
    $this->assertOwnership($id, $req->user['user_id']);

    $updated = Course::update($id, $req->only([
      'title',
      'description',
      'thumbnail_url',
      'category_id',
      'is_published',
    ]));

    if (!$updated)
      Response::notFound('Course not found.');
    Response::success($updated);
  }

  // DELETE /courses/:id — teacher (owner)
  public function destroy(Request $req): void
  {
    $id = $req->params['id'];
    $this->assertOwnership($id, $req->user['user_id']);

    if (!Course::delete($id))
      Response::notFound('Course not found.');
    Response::json(['message' => 'Course deleted.']);
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

  public function mine(Request $req): void
  {
    Response::success(Course::findByTeacher($req->user['user_id']));
  }
}