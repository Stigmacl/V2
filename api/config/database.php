<?php
/**
 * Configuración de Base de Datos para Tactical Ops 3.5 Chile
 * Configurado para XAMPP con MySQL
 */

class Database {
    private $host = 'localhost';
    private $db_name = 'tactical_ops_chile';
    private $username = 'root';
    private $password = '';
    private $conn;

    public function getConnection() {
        $this->conn = null;

        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=utf8mb4",
                $this->username,
                $this->password,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ]
            );
        } catch(PDOException $exception) {
            error_log("Connection error: " . $exception->getMessage());
            throw new Exception("Error de conexión a la base de datos");
        }

        return $this->conn;
    }

    public function closeConnection() {
        $this->conn = null;
    }
}

// Configuración de CORS para desarrollo
header('Access-Control-Allow-Origin: http://localhost');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

// Manejar preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Configuración de respuesta JSON
header('Content-Type: application/json; charset=utf-8');

// Función helper para respuestas JSON
function jsonResponse($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit();
}

// Función helper para errores
function errorResponse($message, $status = 400) {
    jsonResponse(['error' => $message], $status);
}

// Función helper para validar entrada JSON
function getJsonInput() {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        errorResponse('JSON inválido', 400);
    }
    
    return $data;
}
?>