<?php
require_once '../config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    $query = "SELECT c.*, 
                     (SELECT COUNT(*) FROM users u WHERE u.clan = c.tag AND u.is_active = 1) as member_count
              FROM clans c 
              ORDER BY c.created_at DESC";
    
    $stmt = $db->prepare($query);
    $stmt->execute();

    $clans = [];
    while ($row = $stmt->fetch()) {
        $clans[] = [
            'id' => $row['id'],
            'name' => $row['name'],
            'tag' => $row['tag'],
            'logo' => $row['logo'],
            'description' => $row['description'],
            'members' => (int)$row['member_count'],
            'createdAt' => $row['created_at']
        ];
    }

    jsonResponse([
        'success' => true,
        'clans' => $clans
    ]);

} catch (Exception $e) {
    error_log($e->getMessage());
    errorResponse('Error interno del servidor', 500);
}
?>