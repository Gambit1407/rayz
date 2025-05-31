<?php

// --- CORS-заголовки ---
header("Access-Control-Allow-Origin: *"); 
// Разрешает доступ со всех доменов, затам лучше поменять на реальный адрес сайта
// header("Access-Control-Allow-Origin: https://example.com");

header("Content-Type: application/json");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { 
    http_response_code(204);
    exit;
}

require_once 'db_config.php';

// --- Чтение и валидация JSON-запроса ---
$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) respondError('Некорректный формат запроса');

$employeeId = $input['employee_id'] ?? null;
$date       = $input['date'] ?? null;
$shiftType  = $input['shift_type'] ?? null;

// --- Базовая валидация входных данных ---
if (
    !is_int($employeeId) ||
    !is_string($date) ||
    !preg_match('/^\d{4}-\d{2}-\d{2}$/', $date) ||
    !is_string($shiftType)
) respondError("Некорректные данные: $employeeId $date $shiftType");

// --- Допустимые значения для смены ---
$allowedShiftTypes = [
        'aircraft', 
        'maintenance', 
        'heavy', 
        'study', 
        ''
    ];
if (!in_array($shiftType, $allowedShiftTypes, true)) respondError('Недопустимый тип смены');


try {
    // --- Удаление записи ---
    if ($shiftType === '') {
        $stmt = $db->prepare("
            DELETE FROM shifts
            WHERE employee_id = :employee_id AND date = :date
        ");
        $stmt->execute([
            ':employee_id' => $employeeId,
            ':date'        => $date
        ]);
        respondSuccess('Запись удалена');
    }

    // --- Вставка или обновление ---
    $stmt = $db->prepare("
        INSERT INTO shifts (employee_id, date, shift_type)
        VALUES (:employee_id, :date, :shift_type)
        ON DUPLICATE KEY UPDATE shift_type = VALUES(shift_type)
    ");
    $stmt->execute([
        ':employee_id' => $employeeId,
        ':date'        => $date,
        ':shift_type'  => $shiftType
    ]);

    respondSuccess('Смена сохранена');
} catch (Exception $e) {
    respondError('Ошибка базы данных: ' . $e->getMessage());
}


// --- Вспомогательные функции ---
function respondSuccess(string $message): void {
    echo json_encode([
        'status'  => 'success',
        'message' => $message
    ]);
    exit;
}

function respondError(string $message): void {
    echo json_encode([
        'status'  => 'error',
        'message' => $message
    ]);
    exit;
}