<?php
// Habilitar todos los errores para depuración
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Asegurarse de que no hay salida antes de este punto
if (ob_get_level()) ob_end_clean();

// Establecer headers CORS y tipo de contenido
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Max-Age: 86400');
header('Content-Type: application/json; charset=utf-8');

// Manejar solicitud OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Verificar método HTTP
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
    exit();
}

// Log del método y contenido raw
error_log("Método HTTP: " . $_SERVER['REQUEST_METHOD']);
$raw_data = file_get_contents('php://input');
error_log("Datos raw recibidos: " . $raw_data);

try {
    require_once '../config/database.php';
    
    // Decodificar JSON
    $data = json_decode($raw_data, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Error al decodificar JSON: ' . json_last_error_msg());
    }
    
    error_log("Datos decodificados: " . print_r($data, true));

    // Validar campos requeridos
    $required = ['nombre', 'descripcion', 'direccion', 'zona_r', 'tipo', 'precio_min', 'precio_max', 'plato_economico', 'plato_caro'];
    $missing = array_filter($required, fn($field) => !isset($data[$field]) || trim($data[$field]) === '');
    
    if (!empty($missing)) {
        throw new Exception("Campos requeridos faltantes: " . implode(', ', $missing));
    }

    // Preparar la consulta
    $sql = "INSERT INTO restaurantes (
        nombre, descripcion, direccion, zona_r, tipo, 
        precio_min, precio_max, plato_economico, plato_caro
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
    RETURNING id";

    error_log("SQL a ejecutar: " . $sql);

    $stmt = $pdo->prepare($sql);
    $params = [
        $data['nombre'],
        $data['descripcion'],
        $data['direccion'],
        $data['zona_r'],
        $data['tipo'],
        (int)$data['precio_min'],
        (int)$data['precio_max'],
        $data['plato_economico'],
        $data['plato_caro']
    ];
    
    error_log("Parámetros: " . print_r($params, true));
    
    $stmt->execute($params);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$result) {
        throw new Exception('No se pudo obtener el ID del restaurante creado');
    }
    
    http_response_code(201);
    echo json_encode([
        'success' => true,
        'id' => $result['id'],
        'message' => 'Restaurante creado exitosamente'
    ]);

} catch (Exception $e) {
    error_log("Error en create_restaurant.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
}
?>