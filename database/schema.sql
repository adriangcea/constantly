CREATE DATABASE IF NOT EXISTS habit_tracker;
USE habit_tracker;

CREATE TABLE Usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    rol VARCHAR(20),
    estado VARCHAR(20)
);

CREATE TABLE Habito (
    id_habito INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    frecuencia ENUM('diaria', 'semanal', 'mensual'),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario)
);

CREATE TABLE RegistroProgreso (
    id_registro INT AUTO_INCREMENT PRIMARY KEY,
    id_habito INT,
    fecha DATE,
    completado BOOLEAN,
    UNIQUE (id_habito, fecha),
    FOREIGN KEY (id_habito) REFERENCES Habito(id_habito)
);

CREATE TABLE Notificacion (
    id_notificacion INT AUTO_INCREMENT PRIMARY KEY,
    id_habito INT,
    hora_recordatorio TIME,
    activa BOOLEAN,
    FOREIGN KEY (id_habito) REFERENCES Habito(id_habito)
);