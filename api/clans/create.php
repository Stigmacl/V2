<?php
require_once '../config/database.php';

session_start();

if (!isset($_SESSION['user_id'])) {
    errorResponse('No autorizado', 401);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    errorResponse('Método no permitido', 405);
}

$data = getJsonInput();

if (!isset($data['name']) || !isset($data['tag'])) {
    errorResponse('Nombre y tag del clan son requeridos');
}

if (strlen($data['tag']) > 8) {
    errorResponse('El tag del clan no puede tener más de 8 caracteres');
}

try {
    $database = new Database();
    $db = $database->getConnection();

    // Verificar que el usuario sea admin
    $userQuery = "SELECT role FROM users WHERE id = :id";
    $userStmt = $db->prepare($userQuery);
    $userStmt->bindParam(':id', $_SESSION['user_id']);
    $userStmt->execute();
    $user = $userStmt->fetch();

    if (!$user || $user['role'] !== 'admin') {
        errorResponse('No tienes permisos para crear clanes', 403);
    }

    // Verificar que el nombre y tag no existan
    $checkQuery = "SELECT id FROM clans WHERE name = :name OR tag = :tag";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->bindParam(':name', $data['name']);
    $checkStmt->bindParam(':tag', $data['tag']);
    $checkStmt->execute();

    if ($checkStmt->fetch()) {
        errorResponse('Ya existe un clan con ese nombre o tag');
    }

    $query = "INSERT INTO clans (name, tag, logo, description) 
              VALUES (:name, :tag, :logo, :description)";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':name', $data['name']);
    $stmt->bindParam(':tag', strtoupper($data['tag']));
    $stmt->bindParam(':logo', $data['logo']);
    $stmt->bindParam(':description', $data['description']);
    $stmt->execute();

    jsonResponse([
        'success' => true,
        'message' => 'Clan creado exitosamente',
        'id' => $db->lastInsertId()
    ]);

} catch (Exception $e) {
    error_log($e->getMessage());
    errorResponse('Error interno del servidor', 500);
}
?>