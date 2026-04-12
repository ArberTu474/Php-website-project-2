<?php
namespace Controllers;

use Config\Database;
use Models\{Enrollment, Review};
use Core\Response;
use Core\Request;

class ReviewController
{
  // POST /enrollments/:id/review
  public function create(Request $req): void
  {
    $enrollmentId = $req->params['id'];
    $studentId = $req->user['user_id'];

    // Confirm enrollment belongs to this student
    $enrollment = Enrollment::findById($enrollmentId);
    if (!$enrollment || $enrollment['student_id'] !== $studentId) {
      Response::error('Enrollment not found.', 404);
    }

    // Must have completed at least 1 lesson
    if ($enrollment['progress_percent'] < 1) {
      Response::error('Complete at least one lesson before leaving a review.', 403);
    }

    $body = $req->body;
    $rating = (int) ($body['rating'] ?? 0);

    if ($rating < 1 || $rating > 5) {
      Response::error('Rating must be between 1 and 5.', 422);
    }

    $review = Review::upsert([
      'enrollment_id' => $enrollmentId,
      'rating' => $rating,
      'comment' => trim($body['comment'] ?? ''),
    ]);

    Response::success($review, 201);
  }
}