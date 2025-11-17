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

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJSON(['success' => false, 'error' => 'Método no permitido'], 405);
}

$data = json_decode(file_get_contents('php://input'), true);

if (!$data || !isset($data['username']) || !isset($data['password'])) {
    sendJSON(['success' => false, 'error' => 'Datos incompletos'], 400);
}

$username = trim($data['username']);
$password = trim($data['password']);

if (empty($username) || empty($password)) {
    sendJSON(['success' => false, 'error' => 'Usuario y contraseña son requeridos'], 400);
}

$pdo = getDBConnection();
if (!$pdo) {
    error_log("Login error: No se pudo conectar a la base de datos");
    sendJSON(['success' => false, 'error' => 'Error de conexión a la base de datos'], 500);
}

try {
    // Buscar usuario por username o email
    $stmt = $pdo->prepare("SELECT * FROM usuarios WHERE username = ? OR email = ?");
    $stmt->execute([$username, $username]);
    $user = $stmt->fetch();
    
    if (!$user) {
        error_log("Login error: Usuario no encontrado - $username");
        sendJSON(['success' => false, 'error' => 'Usuario o contraseña incorrectos'], 401);
    }
    
    // Verificar contraseña
    if (!password_verify($password, $user['password'])) {
        error_log("Login error: Contraseña incorrecta para usuario - $username");
        sendJSON(['success' => false, 'error' => 'Usuario o contraseña incorrectos'], 401);
    }
    
    // Crear sesión
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['username'] = $user['username'];
    $_SESSION['nombre'] = $user['nombre'];
    $_SESSION['email'] = $user['email'];
    $_SESSION['rol'] = $user['rol'];
    
    sendJSON([
        'success' => true,
        'message' => 'Inicio de sesión exitoso',
        'user' => [
            'id' => $user['id'],
            'username' => $user['username'],
            'nombre' => $user['nombre'],
            'email' => $user['email'],
            'rol' => $user['rol']
        ]
    ]);
    
} catch (PDOException $e) {
    error_log("Error en login: " . $e->getMessage());
    sendJSON(['success' => false, 'error' => 'Error en el servidor'], 500);
}
?>
