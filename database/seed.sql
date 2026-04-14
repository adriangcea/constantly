INSERT INTO Usuario (nombre, email, password_hash, rol, estado)
VALUES 
('Admin', 'admin@test.com', 'hash123', 'admin', 'activo'),
('Usuario1', 'user1@test.com', 'hash123', 'usuario', 'activo');

INSERT INTO Habito (id_usuario, nombre, descripcion, frecuencia)
VALUES
(1, 'Beber agua', 'Beber 2L de agua', 'diaria'),
(1, 'Hacer ejercicio', '30 minutos', 'diaria');