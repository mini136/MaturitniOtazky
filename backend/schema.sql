CREATE DATABASE
IF NOT EXISTS maturitni_otazky
  CHARACTER
SET utf8mb4
COLLATE utf8mb4_czech_ci;

USE maturitni_otazky;

CREATE TABLE
IF NOT EXISTS comments
(
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  question_path VARCHAR
(255) NOT NULL,
  nick VARCHAR
(40) NOT NULL,
  email VARCHAR
(120) NULL,
  kind ENUM
('chyba', 'chybi', 'dotaz', 'jine') NOT NULL DEFAULT 'jine',
  message TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY
(id),
  KEY idx_question_path
(question_path),
  KEY idx_created_at
(created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_czech_ci;
