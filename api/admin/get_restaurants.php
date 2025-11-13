<?php
require_once '../config/database.php';
header('Content-Type: application/json');

try {
    $stmt = $pdo->query('SELECT * FROM restaurantes ORDER BY nombre');
    $restaurants = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($restaurants);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error al obtener los restaurantes: ' . $e->getMessage()]);
}
?>