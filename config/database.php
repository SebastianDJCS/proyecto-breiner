

<?php
// Habilitar visualización de errores
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Configuración de la base de datos Neon (PostgreSQL)
$host = 'ep-bitter-pond-adc167pq-pooler.c-2.us-east-1.aws.neon.tech';
$dbname = 'neondb';
$user = 'neondb_owner';
$pass = 'npg_3xo2bVKjNDei';
$port = '5432';

try {
    // Crear conexión PDO con PostgreSQL de forma explícita
    $dsn = "pgsql:host=$host;port=$port;dbname=$dbname;sslmode=require";
    $pdo = new PDO($dsn, $user, $pass);
    
    // Configurar PDO para lanzar excepciones en caso de errores
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    
} catch(PDOException $e) {
    // En producción, deberías manejar el error de forma más segura
    die("Error de conexión: " . $e->getMessage());
}