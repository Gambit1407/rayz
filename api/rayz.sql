-- Инициализирующий SQL-скрипт для базы данных "rayz"

-- Удаляем базу, если она существует (ОСТОРОЖНО на production)
DROP DATABASE IF EXISTS rayz;
CREATE DATABASE rayz CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE rayz;

-- Таблица сотрудников
DROP TABLE IF EXISTS employees;
CREATE TABLE employees (
  id INT(11) NOT NULL AUTO_INCREMENT,
  last_name VARCHAR(100) NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Таблица смен
DROP TABLE IF EXISTS shifts;
CREATE TABLE shifts (
  id INT(11) NOT NULL AUTO_INCREMENT,
  employee_id INT(11) NOT NULL,
  date DATE NOT NULL,
  shift_type ENUM('aircraft', 'maintenance', 'heavy', 'study') NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY unique_employee_date (employee_id, date),
  CONSTRAINT fk_employee_shift FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Начальные данные: сотрудники
INSERT INTO employees (last_name) VALUES
('Иванов'),
('Петров'),
('Сидоров'),
('Кузнецова'),
('Смирнов');

-- Начальные данные: смены (май–июнь 2025)
INSERT INTO shifts (employee_id, date, shift_type) VALUES
(1, '2025-05-02', 'aircraft'),
(1, '2025-05-14', 'maintenance'),
(1, '2025-06-05', 'heavy'),
(1, '2025-06-21', 'heavy'),

(2, '2025-05-06', 'study'),
(2, '2025-05-22', 'maintenance'),
(2, '2025-05-14', 'heavy'),
(2, '2025-06-10', 'aircraft'),

(3, '2025-05-03', 'heavy'),
(3, '2025-05-25', 'study'),
(3, '2025-06-15', 'maintenance'),

(4, '2025-05-09', 'aircraft'),
(4, '2025-06-02', 'study'),
(4, '2025-06-18', 'heavy'),

(5, '2025-05-13', 'maintenance'),
(5, '2025-05-27', 'study'),
(5, '2025-06-06', 'aircraft'),
(5, '2025-06-19', 'heavy'),
(5, '2025-05-14', 'heavy');