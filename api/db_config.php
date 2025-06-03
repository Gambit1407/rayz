<?php
// config/db_config.php
$hostDB = "localhost";
$baseName = "rayz";
$userDB = "root";
$passDB = '!Popova14';

try {
    $db = new PDO(
        "mysql:host=$hostDB;dbname=$baseName;charset=utf8", 
        $userDB, 
        $passDB
    );
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Ошибка подключения к базе данных: " . $e->getMessage());
}