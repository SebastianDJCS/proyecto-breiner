<?php
require_once '../config.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if (!isLoggedIn()) {
    sendJSON(['success' => false, 'error' => 'Debe iniciar sesión'], 401);
}

$usuario_id = $_SESSION['user_id'];

$pdo = getDBConnection();
if (!$pdo) {
    sendJSON(['success' => false, 'error' => 'Error de conexión'], 500);
}

try {
    // Obtener todos los restaurantes favoritos del usuario
    $stmt = $pdo->prepare("
        SELECT r.*, f.fecha_agregado
        FROM restaurantes r
        INNER JOIN favoritos f ON r.id = f.restaurante_id
        WHERE f.usuario_id = ?
        ORDER BY f.fecha_agregado DESC
    ");
    
    $stmt->execute([$usuario_id]);
    $favoritos = $stmt->fetchAll();
    
    sendJSON([
        'success' => true,
        'favoritos' => $favoritos
    ]);
    
} catch (PDOException $e) {
    error_log("Error en get_favoritos: " . $e->getMessage());
    sendJSON(['success' => false, 'error' => 'Error al obtener favoritos'], 500);
}
?>
