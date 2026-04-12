<?php

declare(strict_types=1);

namespace Core;

use PDO;
use PDOException;
use RuntimeException;

class Database
{
    private static ?PDO $instance = null;

    // Prevent direct instantiation — only ::connect() is the entry point
    private function __construct()
    {
    }
    private function __clone()
    {
    }

    public static function connect(): PDO
    {
        if (self::$instance !== null) {
            return self::$instance;
        }

        $host = $_ENV['DB_HOST'] ?? '';
        $name = $_ENV['DB_NAME'] ?? '';
        $user = $_ENV['DB_USER'] ?? '';
        $pass = $_ENV['DB_PASS'] ?? '';

        if (!$host || !$name || !$user) {
            throw new RuntimeException('Missing required DB_* environment variables.');
        }

        $dsn = "pgsql:host={$host};dbname={$name};sslmode=require;channel_binding=disable";

        try {
            self::$instance = new PDO($dsn, $user, $pass, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,            // throw on SQL errors
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,       // arrays, not objects
                PDO::ATTR_EMULATE_PREPARES => false,                    // real prepared statements
            ]);
        } catch (PDOException $e) {
            // Never expose raw DB errors to the client
            error_log('DB connection failed: ' . $e->getMessage());
        }

        return self::$instance;
    }
}