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

if (!isset($data['commentId'])) {
    errorResponse('ID de comentario requerido');
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
        errorResponse('No tienes permisos para moderar comentarios', 403);
    }

    // Verificar que el comentario existe
    $checkQuery = "SELECT id, content, user_id FROM comments WHERE id = :id AND is_deleted = 0";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->bindParam(':id', $data['commentId']);
    $checkStmt->execute();

    if (!$checkStmt->fetch()) {
        errorResponse('Comentario no encontrado', 404);
    }

    // Marcar comentario como eliminado
    $deleteQuery = "UPDATE comments 
                   SET is_deleted = 1, 
                       deleted_by = :deleted_by, 
                       deleted_at = NOW(), 
                       deletion_reason = :reason 
                   WHERE id = :id";
    
    $deleteStmt = $db->prepare($deleteQuery);
    $deleteStmt->bindParam(':id', $data['commentId']);
    $deleteStmt->bindParam(':deleted_by', $_SESSION['user_id']);
    $deleteStmt->bindParam(':reason', $data['reason'] ?? 'Moderación administrativa');
    $deleteStmt->execute();

    jsonResponse([
        'success' => true,
        'message' => 'Comentario eliminado exitosamente'
    ]);

} catch (Exception $e) {
    error_log($e->getMessage());
    errorResponse('Error interno del servidor', 500);
}
?>