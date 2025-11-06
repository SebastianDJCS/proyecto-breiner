<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config/database.php';

function getRestaurants($filters = []) {
    global $pdo;
    
    try {
        $where = [];
        $params = [];
        
        // Construir la consulta base
        $sql = "SELECT 
                    r.id,
                    r.nombre as name,
                    r.categoria as category,
                    r.precio_promedio as averagePrice,
                    r.calificacion as rating,
                    r.ubicacion as location,
                    r.tipo_cocina as cuisineType,
                    r.horario as schedule,
                    r.direccion as address,
                    STRING_AGG(c.caracteristica, ',') as features
                FROM restaurantes r
                LEFT JOIN caracteristicas_restaurante cr ON r.id = cr.restaurante_id
                LEFT JOIN caracteristicas c ON cr.caracteristica_id = c.id";

        // Filtrar por texto de búsqueda
        if (!empty($filters['searchText'])) {
            $where[] = "(r.nombre ILIKE ? OR r.direccion ILIKE ?)";
            $searchTerm = "%{$filters['searchText']}%";
            $params[] = $searchTerm;
            $params[] = $searchTerm;
        }

        // Filtrar por categoría
        if (!empty($filters['category']) && $filters['category'] !== 'all') {
            $where[] = "r.categoria = ?";
            $params[] = $filters['category'];
        }

        // Filtrar por precio mínimo
        if (!empty($filters['minPrice'])) {
            $where[] = "r.precio_promedio >= ?";
            $params[] = $filters['minPrice'];
        }

        // Filtrar por calificación mínima
        if (!empty($filters['minRating'])) {
            $where[] = "r.calificacion >= ?";
            $params[] = $filters['minRating'];
        }

        // Filtrar por características
        if (!empty($filters['features'])) {
            $featuresCount = count($filters['features']);
            $placeholders = str_repeat('?,', $featuresCount - 1) . '?';
            $where[] = "c.caracteristica IN ($placeholders)";
            $params = array_merge($params, $filters['features']);
        }

        // Agregar condiciones WHERE si existen
        if (!empty($where)) {
            $sql .= " WHERE " . implode(" AND ", $where);
        }

        // Agrupar por restaurante para manejar múltiples características
        $sql .= " GROUP BY r.id";

        // Preparar y ejecutar la consulta
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        
        return $stmt->fetchAll();

    } catch(PDOException $e) {
        http_response_code(500);
        return ["error" => "Error en la base de datos: " . $e->getMessage()];
    }
}

// Manejar la solicitud
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Obtener parámetros de búsqueda
    $filters = [
        'searchText' => $_GET['search'] ?? '',
        'category' => $_GET['category'] ?? '',
        'maxPrice' => $_GET['maxPrice'] ?? null,
        'minRating' => $_GET['rating'] ?? null,
        'features' => isset($_GET['features']) ? explode(',', $_GET['features']) : []
    ];

    echo json_encode(getRestaurants($filters));
} else {
    http_response_code(405);
    echo json_encode(["error" => "Método no permitido"]);
}