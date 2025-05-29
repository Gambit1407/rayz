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

// --- Получение параметров ---
$year  = isset($_GET['year'])  ? intval($_GET['year'])  : date('Y');
$month = isset($_GET['month']) ? intval($_GET['month']) : date('n');

// --- Расчёт диапазона дат ---
$startDate = sprintf('%04d-%02d-01', $year, $month);
$endDate   = date('Y-m-t', strtotime($startDate)); // последняя дата месяца

try {
    // --- Получение списка сотрудников ---
    $stmtEmployees = $db->query("
        SELECT id, last_name 
        FROM employees 
        ORDER BY last_name");
    $employees = $stmtEmployees->fetchAll(PDO::FETCH_ASSOC);

    // --- Получение смен за указанный период ---
    $stmtShifts = $db->prepare("
        SELECT employee_id, date, shift_type 
        FROM shifts 
        WHERE date BETWEEN :start AND :end
    ");
    $stmtShifts->execute([
        'start' => $startDate, 
        'end'   => $endDate
    ]);
    $shifts = $stmtShifts->fetchAll(PDO::FETCH_ASSOC);

    // --- Возвращаем объединённые данные ---
    respondSuccess([
        'employees' => $employees,
        'shifts'    => $shifts
    ]);
} catch (PDOException $e) {
    respondError('Ошибка базы данных: ' . $e->getMessage());

}

// --- Вспомогательные функции ---
function respondSuccess(array $data): void {
    echo json_encode(array_merge(['status' => 'success'], $data));
    exit;
}

function respondError(string $message): void {
    echo json_encode([
        'status'  => 'error',
        'message' => $message
    ]);
    exit;
}