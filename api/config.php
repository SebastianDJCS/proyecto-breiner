<?php
// Archivo de configuración de base de datos y sesiones
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Configuración de la base de datos
define('DB_HOST', 'ep-bitter-pond-adc167pq-pooler.c-2.us-east-1.aws.neon.tech');
define('DB_NAME', 'neondb');
define('DB_USER', 'neondb_owner');
define('DB_PASS', 'npg_3xo2bVKjNDei');
define('DB_PORT', '5432');

// Función para obtener conexión PDO
function getDBConnection() {
    try {
        $dsn = "pgsql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";sslmode=require";
        $pdo = new PDO($dsn, DB_USER, DB_PASS);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        $pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
        return $pdo;
    } catch (PDOException $e) {
        error_log("Error de conexión: " . $e->getMessage());
        return null;
    }
}

// Función para verificar si el usuario está logueado
function isLoggedIn() {
    return isset($_SESSION['user_id']) && !empty($_SESSION['user_id']);
}

// Función para obtener datos del usuario actual
function getCurrentUser() {
    if (!isLoggedIn()) {
        return null;
    }
    return [
        'id' => $_SESSION['user_id'],
        'username' => $_SESSION['username'] ?? '',
        'nombre' => $_SESSION['nombre'] ?? '',
        'email' => $_SESSION['email'] ?? '',
        'rol' => $_SESSION['rol'] ?? 'usuario'
    ];
}

// Función para verificar si el usuario es admin
function isAdmin() {
    return isLoggedIn() && isset($_SESSION['rol']) && $_SESSION['rol'] === 'admin';
}

// Función para enviar respuesta JSON
function sendJSON($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}
?>
