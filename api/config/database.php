<?php
// Asegurarse de que no hay salida antes de este punto
if (ob_get_level()) ob_end_clean();

header('Content-Type: application/json; charset=utf-8');

// Configuración de la base de datos Neon (PostgreSQL)
$host = 'ep-bitter-pond-adc167pq-pooler.c-2.us-east-1.aws.neon.tech';
$dbname = 'neondb';
$user = 'neondb_owner';
$pass = 'npg_3xo2bVKjNDei';

try {
    $dsn = "pgsql:host=$host;port=5432;dbname=$dbname;sslmode=require";
    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false
    ]);
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error de conexión a la base de datos']);
    exit;
}