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

if (!isset($data['current_password']) || !isset($data['new_password'])) {
    sendJSON(['success' => false, 'error' => 'Datos incompletos'], 400);
}

$currentPassword = trim($data['current_password']);
$newPassword = trim($data['new_password']);
$usuario_id = $_SESSION['user_id'];

// Validar longitud de nueva contraseña
if (strlen($newPassword) < 6) {
    sendJSON(['success' => false, 'error' => 'La contraseña debe tener al menos 6 caracteres'], 400);
}

$pdo = getDBConnection();
if (!$pdo) {
    sendJSON(['success' => false, 'error' => 'Error de conexión'], 500);
}

try {
    // Obtener contraseña actual del usuario
    $stmt = $pdo->prepare("SELECT password FROM usuarios WHERE id = ?");
    $stmt->execute([$usuario_id]);
    $user = $stmt->fetch();
    
    if (!$user) {
        sendJSON(['success' => false, 'error' => 'Usuario no encontrado'], 404);
    }
    
    // Verificar contraseña actual
    if (!password_verify($currentPassword, $user['password'])) {
        sendJSON(['success' => false, 'error' => 'Contraseña actual incorrecta'], 401);
    }
    
    // Hash de la nueva contraseña
    $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
    
    // Actualizar contraseña
    $stmt = $pdo->prepare("UPDATE usuarios SET password = ? WHERE id = ?");
    $stmt->execute([$hashedPassword, $usuario_id]);
    
    sendJSON([
        'success' => true,
        'message' => 'Contraseña actualizada exitosamente'
    ]);
    
} catch (PDOException $e) {
    error_log("Error en change_password: " . $e->getMessage());
    sendJSON(['success' => false, 'error' => 'Error al cambiar contraseña'], 500);
}
?>