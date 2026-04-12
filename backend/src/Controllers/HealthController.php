<?php

declare(strict_types=1);

namespace Controllers;

use Core\{Request, Response, Database};

class HealthController
{
  public function check(Request $req): void
  {
    $db = Database::connect();
    $time = $db->query('SELECT NOW() as time')->fetch();
    Response::success(['api' => 'running', 'db_time' => $time['time']]);
  }
}