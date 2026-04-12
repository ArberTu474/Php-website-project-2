<?php

declare(strict_types=1);

namespace Controllers;

use Core\{Request, Response, JWT};
use Models\User;

class AuthController
{
  // POST /auth/register
  public function register(Request $req): void
  {
    $email = trim((string) $req->input('email', ''));
    $password = (string) $req->input('password', '');
    $first_name = trim((string) $req->input('first_name', ''));
    $last_name = trim((string) $req->input('last_name', ''));
    $role = (string) $req->input('role', '');

    // ── Validation ────────────────────────────────────────────────────────
    $errors = [];
    if (!filter_var($email, FILTER_VALIDATE_EMAIL))
      $errors[] = 'Invalid email address.';
    if (strlen($password) < 8)
      $errors[] = 'Password must be at least 8 characters.';
    if (empty($first_name))
      $errors[] = 'First name is required.';
    if (empty($last_name))
      $errors[] = 'Last name is required.';
    if (!in_array($role, ['teacher', 'student'], true))
      $errors[] = 'Role must be teacher or student.';

    if ($errors)
      Response::error(implode(' ', $errors), 422);

    if (User::emailExists($email))
      Response::error('Email is already in use.', 409);

    // ── Create ────────────────────────────────────────────────────────────
    $user = User::create([
      'email' => $email,
      'password_hash' => password_hash($password, PASSWORD_BCRYPT),
      'first_name' => $first_name,
      'last_name' => $last_name,
      'role' => $role,
    ]);

    $token = JWT::encode(['user_id' => $user['user_id'], 'role' => $user['role']]);

    Response::success(['user' => $user, 'token' => $token], 201);
  }

  // POST /auth/login
  public function login(Request $req): void
  {
    $email = trim((string) $req->input('email', ''));
    $password = (string) $req->input('password', '');

    if (empty($email) || empty($password)) {
      Response::error('Email and password are required.', 422);
    }

    $user = User::findByEmail($email);

    // Identical error message for "no user" and "wrong password"
    // — prevents email enumeration attacks
    if (!$user || !password_verify($password, $user['password_hash'])) {
      Response::error('Invalid email or password.', 401);
    }

    $token = JWT::encode(['user_id' => $user['user_id'], 'role' => $user['role']]);

    unset($user['password_hash']); // never expose hash to client

    Response::success(['user' => $user, 'token' => $token]);
  }

  // GET /auth/me  — requires 'auth' middleware
  public function me(Request $req): void
  {
    // $req->user is injected by Middleware::verifyToken()
    $user = User::findById($req->user['user_id']);
    if (!$user)
      Response::notFound('User not found.');
    Response::success($user);
  }
}