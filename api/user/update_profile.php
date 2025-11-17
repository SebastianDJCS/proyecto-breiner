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

if (!isset($data['email']) || empty(trim($data['email']))) {
    sendJSON(['success' => false, 'error' => 'Email es requerido'], 400);
}

$nombre = isset($data['nombre']) ? trim($data['nombre']) : '';
$email = trim($data['email']);
$usuario_id = $_SESSION['user_id'];

// Validar formato de email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    sendJSON(['success' => false, 'error' => 'Email no válido'], 400);
}

$pdo = getDBConnection();
if (!$pdo) {
    sendJSON(['success' => false, 'error' => 'Error de conexión'], 500);
}

try {
    // Verificar si el email ya está en uso por otro usuario
    $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE email = ? AND id != ?");
    $stmt->execute([$email, $usuario_id]);
    
    if ($stmt->fetch()) {
        sendJSON(['success' => false, 'error' => 'El email ya está en uso'], 409);
    }
    
    // Actualizar perfil
    $stmt = $pdo->prepare("
        UPDATE usuarios 
        SET nombre = ?, email = ? 
        WHERE id = ?
    ");
    
    $stmt->execute([$nombre, $email, $usuario_id]);
    
    // Actualizar sesión
    $_SESSION['nombre'] = $nombre;
    $_SESSION['email'] = $email;
    
    sendJSON([
        'success' => true,
        'message' => 'Perfil actualizado exitosamente',
        'user' => [
            'nombre' => $nombre,
            'email' => $email
        ]
    ]);
    
} catch (PDOException $e) {
    error_log("Error en update_profile: " . $e->getMessage());
    sendJSON(['success' => false, 'error' => 'Error al actualizar perfil'], 500);
}
?>