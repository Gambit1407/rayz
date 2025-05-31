<?php

// --- CORS ---
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once 'db_config.php';

// --- Параметр года ---
$year = isset($_GET['year']) ? (int)$_GET['year'] : (int)date('Y');
if ($year < 2000 || $year > 2100) {
    respondError("Недопустимый год: $year");
}

$startDate = "$year-01-01";
$endDate   = "$year-12-31";

try {
    // Получаем всех сотрудников
    $stmtEmployees = $db->query("SELECT id, last_name FROM employees ORDER BY last_name");
    $employees = $stmtEmployees->fetchAll(PDO::FETCH_ASSOC);

    // Получаем агрегацию по типам смен за год
    $stmtStats = $db->prepare("
        SELECT employee_id, shift_type, COUNT(*) AS total
        FROM shifts
        WHERE date BETWEEN :start AND :end
        GROUP BY employee_id, shift_type
    ");
    $stmtStats->execute([
        ':start' => $startDate,
        ':end'   => $endDate
    ]);

    $rawStats = $stmtStats->fetchAll(PDO::FETCH_ASSOC);

    // Инициализация структуры с нулями
    $stats = [];
    foreach ($employees as $emp) {
        $stats[$emp['id']] = [
            'employee'    => $emp['last_name'],
            'aircraft'    => 0,
            'maintenance' => 0,
            'heavy'       => 0,
            'study'       => 0,
            'total'       => 0
        ];
    }

    // Заполняем статистику
    foreach ($rawStats as $row) {
        $id = $row['employee_id'];
        $type = $row['shift_type'];
        $count = (int)$row['total'];

        if (isset($stats[$id][$type])) {
            $stats[$id][$type] = $count;
            $stats[$id]['total'] += $count;
        }
    }

    respondSuccess([
        'year'      => $year,
        'employees' => array_values($stats)
    ]);

} catch (Exception $e) {
    respondError("Ошибка базы данных: " . $e->getMessage());
}

// --- Ответы ---
function respondSuccess(array $data): void {
    echo json_encode(['status' => 'success'] + $data);
    exit;
}

function respondError(string $message): void {
    echo json_encode(['status' => 'error', 'message' => $message]);
    exit;
}