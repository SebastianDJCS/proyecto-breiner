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
    sendJSON(['success' => false, 'loggedIn' => false], 200);
}

$usuario_id = $_SESSION['user_id'];

$pdo = getDBConnection();
if (!$pdo) {
    sendJSON(['success' => false, 'error' => 'Error de conexión'], 500);
}

try {
    // Obtener IDs de todos los restaurantes favoritos
    $stmt = $pdo->prepare("SELECT restaurante_id FROM favoritos WHERE usuario_id = ?");
    $stmt->execute([$usuario_id]);
    $favoritos = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    sendJSON([
        'success' => true,
        'loggedIn' => true,
        'favoritos' => $favoritos
    ]);
    
} catch (PDOException $e) {
    error_log("Error en check_favoritos: " . $e->getMessage());
    sendJSON(['success' => false, 'error' => 'Error al verificar favoritos'], 500);
}
?>
