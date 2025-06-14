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
    errorResponse('ID de usuario requerido');
}

try {
    $database = new Database();
    $db = $database->getConnection();

    // Verificar que el usuario sea admin o esté editando su propio perfil
    $userQuery = "SELECT role FROM users WHERE id = :id";
    $userStmt = $db->prepare($userQuery);
    $userStmt->bindParam(':id', $_SESSION['user_id']);
    $userStmt->execute();
    $currentUser = $userStmt->fetch();

    if (!$currentUser || ($currentUser['role'] !== 'admin' && $_SESSION['user_id'] != $data['id'])) {
        errorResponse('No tienes permisos para editar este usuario', 403);
    }

    // Verificar que el usuario a editar existe
    $checkQuery = "SELECT id, username, email FROM users WHERE id = :id";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->bindParam(':id', $data['id']);
    $checkStmt->execute();
    $targetUser = $checkStmt->fetch();

    if (!$targetUser) {
        errorResponse('Usuario no encontrado', 404);
    }

    // Construir query de actualización dinámicamente
    $updateFields = [];
    $params = [':id' => $data['id']];

    if (isset($data['username'])) {
        // Verificar que el username no esté en uso por otro usuario
        $usernameCheckQuery = "SELECT id FROM users WHERE username = :username AND id != :id";
        $usernameCheckStmt = $db->prepare($usernameCheckQuery);
        $usernameCheckStmt->bindParam(':username', $data['username']);
        $usernameCheckStmt->bindParam(':id', $data['id']);
        $usernameCheckStmt->execute();

        if ($usernameCheckStmt->fetch()) {
            errorResponse('El nombre de usuario ya está en uso');
        }

        $updateFields[] = "username = :username";
        $params[':username'] = $data['username'];
    }

    if (isset($data['email'])) {
        // Verificar que el email no esté en uso por otro usuario
        $emailCheckQuery = "SELECT id FROM users WHERE email = :email AND id != :id";
        $emailCheckStmt = $db->prepare($emailCheckQuery);
        $emailCheckStmt->bindParam(':email', $data['email']);
        $emailCheckStmt->bindParam(':id', $data['id']);
        $emailCheckStmt->execute();

        if ($emailCheckStmt->fetch()) {
            errorResponse('El email ya está en uso');
        }

        $updateFields[] = "email = :email";
        $params[':email'] = $data['email'];
    }

    // Solo admins pueden cambiar roles
    if (isset($data['role']) && $currentUser['role'] === 'admin') {
        $updateFields[] = "role = :role";
        $params[':role'] = $data['role'];
    }

    if (isset($data['avatar'])) {
        $updateFields[] = "avatar = :avatar";
        $params[':avatar'] = $data['avatar'];
    }

    if (isset($data['status'])) {
        $updateFields[] = "status = :status";
        $params[':status'] = $data['status'];
    }

    if (isset($data['clan'])) {
        $updateFields[] = "clan = :clan";
        $params[':clan'] = $data['clan'] ?: null;
    }

    if (empty($updateFields)) {
        errorResponse('No hay campos para actualizar');
    }

    $query = "UPDATE users SET " . implode(', ', $updateFields) . " WHERE id = :id";
    $stmt = $db->prepare($query);
    
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    
    $stmt->execute();

    jsonResponse([
        'success' => true,
        'message' => 'Usuario actualizado exitosamente'
    ]);

} catch (Exception $e) {
    error_log($e->getMessage());
    errorResponse('Error interno del servidor', 500);
}
?>