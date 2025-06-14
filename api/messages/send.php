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

if (!isset($data['toUserId']) || !isset($data['content'])) {
    errorResponse('Usuario destinatario y contenido son requeridos');
}

if (trim($data['content']) === '') {
    errorResponse('El mensaje no puede estar vacío');
}

if ($data['toUserId'] == $_SESSION['user_id']) {
    errorResponse('No puedes enviarte un mensaje a ti mismo');
}

try {
    $database = new Database();
    $db = $database->getConnection();

    // Verificar que el usuario destinatario existe
    $checkUserQuery = "SELECT id FROM users WHERE id = :id AND is_active = 1";
    $checkUserStmt = $db->prepare($checkUserQuery);
    $checkUserStmt->bindParam(':id', $data['toUserId']);
    $checkUserStmt->execute();

    if (!$checkUserStmt->fetch()) {
        errorResponse('Usuario destinatario no encontrado');
    }

    $query = "INSERT INTO messages (from_user_id, to_user_id, content) 
              VALUES (:from_user_id, :to_user_id, :content)";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':from_user_id', $_SESSION['user_id']);
    $stmt->bindParam(':to_user_id', $data['toUserId']);
    $stmt->bindParam(':content', trim($data['content']));
    $stmt->execute();

    jsonResponse([
        'success' => true,
        'message' => 'Mensaje enviado exitosamente',
        'id' => $db->lastInsertId()
    ]);

} catch (Exception $e) {
    error_log($e->getMessage());
    errorResponse('Error interno del servidor', 500);
}
?>