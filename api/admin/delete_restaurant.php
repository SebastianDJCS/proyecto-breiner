<?php
require_once '../config/database.php';
header('Content-Type: application/json');

$id = isset($_GET['id']) ? $_GET['id'] : null;

if (!$id) {
    http_response_code(400);
    echo json_encode(['error' => 'ID no proporcionado']);
    exit;
}

try {
    $stmt = $pdo->prepare('DELETE FROM restaurantes WHERE id = $1');
    $stmt->execute([$id]);
    
    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(['error' => 'Restaurante no encontrado']);
        exit;
    }
    
    echo json_encode(['message' => 'Restaurante eliminado exitosamente']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error al eliminar el restaurante: ' . $e->getMessage()]);
}
?>