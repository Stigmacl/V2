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

if (!isset($data['id'])) {
    errorResponse('ID de clan requerido');
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
        errorResponse('No tienes permisos para editar clanes', 403);
    }

    // Verificar que el clan existe
    $checkQuery = "SELECT id, tag FROM clans WHERE id = :id";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->bindParam(':id', $data['id']);
    $checkStmt->execute();
    $existingClan = $checkStmt->fetch();

    if (!$existingClan) {
        errorResponse('Clan no encontrado', 404);
    }

    // Construir query de actualización dinámicamente
    $updateFields = [];
    $params = [':id' => $data['id']];

    if (isset($data['name'])) {
        $updateFields[] = "name = :name";
        $params[':name'] = $data['name'];
    }

    if (isset($data['tag'])) {
        if (strlen($data['tag']) > 8) {
            errorResponse('El tag del clan no puede tener más de 8 caracteres');
        }
        
        // Verificar que el nuevo tag no exista (excepto el actual)
        $tagCheckQuery = "SELECT id FROM clans WHERE tag = :tag AND id != :id";
        $tagCheckStmt = $db->prepare($tagCheckQuery);
        $tagCheckStmt->bindParam(':tag', strtoupper($data['tag']));
        $tagCheckStmt->bindParam(':id', $data['id']);
        $tagCheckStmt->execute();

        if ($tagCheckStmt->fetch()) {
            errorResponse('Ya existe un clan con ese tag');
        }

        $updateFields[] = "tag = :tag";
        $params[':tag'] = strtoupper($data['tag']);
    }

    if (isset($data['logo'])) {
        $updateFields[] = "logo = :logo";
        $params[':logo'] = $data['logo'];
    }

    if (isset($data['description'])) {
        $updateFields[] = "description = :description";
        $params[':description'] = $data['description'];
    }

    if (empty($updateFields)) {
        errorResponse('No hay campos para actualizar');
    }

    $query = "UPDATE clans SET " . implode(', ', $updateFields) . " WHERE id = :id";
    $stmt = $db->prepare($query);
    
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    
    $stmt->execute();

    // Si se cambió el tag, actualizar usuarios que tenían el tag anterior
    if (isset($data['tag']) && $data['tag'] !== $existingClan['tag']) {
        $updateUsersQuery = "UPDATE users SET clan = :new_tag WHERE clan = :old_tag";
        $updateUsersStmt = $db->prepare($updateUsersQuery);
        $updateUsersStmt->bindParam(':new_tag', strtoupper($data['tag']));
        $updateUsersStmt->bindParam(':old_tag', $existingClan['tag']);
        $updateUsersStmt->execute();
    }

    jsonResponse([
        'success' => true,
        'message' => 'Clan actualizado exitosamente'
    ]);

} catch (Exception $e) {
    error_log($e->getMessage());
    errorResponse('Error interno del servidor', 500);
}
?>