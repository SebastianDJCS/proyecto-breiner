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

if (isLoggedIn()) {
    sendJSON([
        'success' => true,
        'loggedIn' => true,
        'user' => getCurrentUser()
    ]);
} else {
    sendJSON([
        'success' => true,
        'loggedIn' => false,
        'user' => null
    ]);
}
?>
