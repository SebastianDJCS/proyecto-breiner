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

// Validar campos requeridos
$requiredFields = ['username', 'password', 'email'];
foreach ($requiredFields as $field) {
    if (!isset($data[$field]) || empty(trim($data[$field]))) {
        sendJSON(['success' => false, 'error' => "El campo '$field' es requerido"], 400);
    }
}

$username = trim($data['username']);
$password = trim($data['password']);
$email = trim($data['email']);
$nombre = isset($data['nombre']) ? trim($data['nombre']) : '';

// Validar formato de email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    sendJSON(['success' => false, 'error' => 'Email no válido'], 400);
}

// Validar longitud de usuario y contraseña
if (strlen($username) < 3 || strlen($username) > 50) {
    sendJSON(['success' => false, 'error' => 'El nombre de usuario debe tener entre 3 y 50 caracteres'], 400);
}

if (strlen($password) < 6) {
    sendJSON(['success' => false, 'error' => 'La contraseña debe tener al menos 6 caracteres'], 400);
}

$pdo = getDBConnection();
if (!$pdo) {
    sendJSON(['success' => false, 'error' => 'Error de conexión a la base de datos'], 500);
}

try {
    // Verificar si el usuario ya existe
    $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE username = ? OR email = ?");
    $stmt->execute([$username, $email]);
    
    if ($stmt->fetch()) {
        sendJSON(['success' => false, 'error' => 'El usuario o email ya está registrado'], 409);
    }
    
    // Hash de la contraseña
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    
    // Insertar nuevo usuario
    $stmt = $pdo->prepare("
        INSERT INTO usuarios (username, password, email, nombre, rol) 
        VALUES (?, ?, ?, ?, 'usuario') 
        RETURNING id
    ");
    
    $stmt->execute([$username, $hashedPassword, $email, $nombre]);
    $result = $stmt->fetch();
    
    if (!$result) {
        sendJSON(['success' => false, 'error' => 'Error al crear el usuario'], 500);
    }
    
    // Crear sesión automáticamente después del registro
    $_SESSION['user_id'] = $result['id'];
    $_SESSION['username'] = $username;
    $_SESSION['nombre'] = $nombre;
    $_SESSION['email'] = $email;
    $_SESSION['rol'] = 'usuario';
    
    sendJSON([
        'success' => true,
        'message' => 'Usuario registrado exitosamente',
        'user' => [
            'id' => $result['id'],
            'username' => $username,
            'nombre' => $nombre,
            'email' => $email,
            'rol' => 'usuario'
        ]
    ]);
    
} catch (PDOException $e) {
    error_log("Error en registro: " . $e->getMessage());
    sendJSON(['success' => false, 'error' => 'Error en el servidor'], 500);
}
?>
