<?php
// Limpiar cualquier salida anterior
if (ob_get_level()) ob_end_clean();

// Headers
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

// Configuración de la base de datos
$host = 'ep-bitter-pond-adc167pq-pooler.c-2.us-east-1.aws.neon.tech';
$dbname = 'neondb';
$user = 'neondb_owner';
$pass = 'npg_3xo2bVKjNDei';
$port = '5432';

$pdo = null;

try {
    $dsn = "pgsql:host=$host;port=$port;dbname=$dbname;sslmode=require";
    $pdo = new PDO($dsn, $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    $pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
    
    // Construir la consulta base
    $sql = "SELECT id, nombre, descripcion, direccion, zona_r, tipo, precio_min, precio_max, plato_economico, plato_caro, url FROM restaurantes WHERE 1=1";
    $params = [];
    
    // Filtrar por búsqueda de texto
    if (!empty($_GET['search'])) {
        $sql .= " AND (nombre ILIKE ? OR descripcion ILIKE ? OR direccion ILIKE ?)";
        $searchTerm = "%{$_GET['search']}%";
        $params[] = $searchTerm;
        $params[] = $searchTerm;
        $params[] = $searchTerm;
    }
    
    // Filtrar por zona
    if (!empty($_GET['zona'])) {
        $sql .= " AND zona_r = ?";
        $params[] = $_GET['zona'];
    }
    
    // Filtrar por tipo
    if (!empty($_GET['tipo'])) {
        $sql .= " AND tipo = ?";
        $params[] = $_GET['tipo'];
    }
    
    // Filtrar por precio mínimo (buscar restaurantes con precio_min mayor o igual al valor seleccionado)
    if (!empty($_GET['precio_max'])) {
        $sql .= " AND precio_min >= ?";
        $params[] = (int)$_GET['precio_max'];
    }
    
    // Ordenar por nombre
    $sql .= " ORDER BY nombre";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $restaurants = $stmt->fetchAll();
    
    $pdo = null;
    
    echo json_encode($restaurants, JSON_UNESCAPED_UNICODE);
    
} catch (PDOException $e) {
    $pdo = null;
    http_response_code(500);
    echo json_encode([
        'error' => 'Error al obtener los restaurantes',
        'message' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}