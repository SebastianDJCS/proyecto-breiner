

<?php
// Configuración de la base de datos Neon (PostgreSQL)
$dbUrl = 'postgresql://neondb_owner:npg_3xo2bVKjNDei@ep-bitter-pond-adc167pq-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

try {
    // Crear conexión PDO con PostgreSQL
    $pdo = new PDO($dbUrl);
    
    // Configurar PDO para lanzar excepciones en caso de errores
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    
} catch(PDOException $e) {
    // En producción, deberías manejar el error de forma más segura
    die("Error de conexión: " . $e->getMessage());
}