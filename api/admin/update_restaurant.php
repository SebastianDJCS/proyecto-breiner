<?php
require_once '../config/database.php';
header('Content-Type: application/json');

$id = isset($_GET['id']) ? $_GET['id'] : null;

if (!$id) {
    http_response_code(400);
    echo json_encode(['error' => 'ID no proporcionado']);
    exit;
}

// Obtener datos del PUT
$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['error' => 'Datos no proporcionados']);
    exit;
}

// Validar campos requeridos
$requiredFields = ['nombre', 'descripcion', 'direccion', 'zona_r', 'tipo', 'precio_min', 'precio_max', 'plato_economico', 'plato_caro'];
foreach ($requiredFields as $field) {
    if (!isset($data[$field])) {
        http_response_code(400);
        echo json_encode(['error' => "Campo requerido faltante: $field"]);
        exit;
    }
}

try {
    $stmt = $pdo->prepare('
        UPDATE restaurantes 
        SET nombre = $1, 
            descripcion = $2, 
            direccion = $3, 
            zona_r = $4, 
            tipo = $5, 
            precio_min = $6, 
            precio_max = $7, 
            plato_economico = $8, 
            plato_caro = $9
        WHERE id = $10
    ');
    
    $stmt->execute([
        $data['nombre'],
        $data['descripcion'],
        $data['direccion'],
        $data['zona_r'],
        $data['tipo'],
        $data['precio_min'],
        $data['precio_max'],
        $data['plato_economico'],
        $data['plato_caro'],
        $id
    ]);
    
    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(['error' => 'Restaurante no encontrado']);
        exit;
    }
    
    echo json_encode(['message' => 'Restaurante actualizado exitosamente']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error al actualizar el restaurante: ' . $e->getMessage()]);
}
?>