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

CREATE TABLE
IF NOT EXISTS chat_questions
(
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  topic_path VARCHAR
(255) NOT NULL,
  selected_text TEXT NOT NULL,
  explanation TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY
(id),
  KEY idx_cq_topic
(topic_path),
  KEY idx_cq_created
(created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_czech_ci;

CREATE TABLE
IF NOT EXISTS ai_quiz_attempts
(
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  subject VARCHAR(20) NOT NULL,
  topic VARCHAR(255) NOT NULL,
  question TEXT NOT NULL,
  user_answer TEXT NOT NULL,
  score TINYINT UNSIGNED NOT NULL DEFAULT 0,
  verdict VARCHAR(50) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY
(id),
  KEY idx_aqa_subject
(subject),
  KEY idx_aqa_topic
(topic),
  KEY idx_aqa_created
(created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_czech_ci;
