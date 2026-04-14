-- Eliminar BD si existe (solo en desarrollo)
DROP DATABASE IF EXISTS habit_tracker;

CREATE DATABASE habit_tracker;
USE habit_tracker;

-- Estructura
SOURCE schema.sql;

-- Lógica
SOURCE procedures.sql;
SOURCE functions.sql;
SOURCE triggers.sql;

-- Datos iniciales
SOURCE seed.sql;