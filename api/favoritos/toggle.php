<?php
require_once '../config.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if (!isLoggedIn()) {
    sendJSON(['success' => false, 'error' => 'Debe iniciar sesión'], 401);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJSON(['success' => false, 'error' => 'Método no permitido'], 405);
}

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['restaurante_id']) || empty($data['restaurante_id'])) {
    sendJSON(['success' => false, 'error' => 'ID de restaurante requerido'], 400);
}

$usuario_id = $_SESSION['user_id'];
$restaurante_id = (int)$data['restaurante_id'];

$pdo = getDBConnection();
if (!$pdo) {
    sendJSON(['success' => false, 'error' => 'Error de conexión'], 500);
}

try {
    // Verificar si ya existe el favorito
    $stmt = $pdo->prepare("SELECT id FROM favoritos WHERE usuario_id = ? AND restaurante_id = ?");
    $stmt->execute([$usuario_id, $restaurante_id]);
    $exists = $stmt->fetch();
    
    if ($exists) {
        // Si existe, eliminarlo (toggle)
        $stmt = $pdo->prepare("DELETE FROM favoritos WHERE usuario_id = ? AND restaurante_id = ?");
        $stmt->execute([$usuario_id, $restaurante_id]);
        
        sendJSON([
            'success' => true,
            'action' => 'removed',
            'message' => 'Restaurante eliminado de favoritos'
        ]);
    } else {
        // Si no existe, agregarlo
        $stmt = $pdo->prepare("INSERT INTO favoritos (usuario_id, restaurante_id) VALUES (?, ?)");
        $stmt->execute([$usuario_id, $restaurante_id]);
        
        sendJSON([
            'success' => true,
            'action' => 'added',
            'message' => 'Restaurante agregado a favoritos'
        ]);
    }
    
} catch (PDOException $e) {
    error_log("Error en toggle_favorito: " . $e->getMessage());
    sendJSON(['success' => false, 'error' => 'Error al procesar favorito'], 500);
}
?>
