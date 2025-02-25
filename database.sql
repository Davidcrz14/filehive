-- Creacion de la base de datos
CREATE DATABASE IF NOT EXISTS filehive;
USE filehive;

-- Tabla de usuarios
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    storage_used BIGINT DEFAULT 0,
    storage_limit BIGINT DEFAULT 52428800 -- 50MB por defecto
);

-- Crear tabla de archivos
CREATE TABLE files (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    downloaded_count INT DEFAULT 0,
    last_downloaded_at TIMESTAMP NULL,
    download_token VARCHAR(128) NOT NULL UNIQUE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Crear tabla de estadísticas
CREATE TABLE statistics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    date DATE NOT NULL,
    total_uploads INT DEFAULT 0,
    total_downloads INT DEFAULT 0,
    total_expired INT DEFAULT 0,
    active_users INT DEFAULT 0,
    UNIQUE KEY (date)
);

-- Crear tabla de logs de actividad
CREATE TABLE activity_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    action_type ENUM('upload', 'download', 'delete', 'expire', 'login', 'register') NOT NULL,
    file_id INT NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE SET NULL
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_files_user ON files(user_id);
CREATE INDEX idx_files_expires ON files(expires_at);
CREATE INDEX idx_files_download_token ON files(download_token);
CREATE INDEX idx_files_created ON files(created_at);
CREATE INDEX idx_activity_user ON activity_logs(user_id);
CREATE INDEX idx_activity_type ON activity_logs(action_type);
CREATE INDEX idx_activity_created ON activity_logs(created_at);

-- Procedimiento almacenado para limpiar archivos expirados
DELIMITER //
CREATE PROCEDURE cleanup_expired_files()
BEGIN
    DECLARE expired_count INT DEFAULT 0;

    -- Contar archivos expirados
    SELECT COUNT(*) INTO expired_count FROM files WHERE expires_at < NOW();

    -- Registrar en estadísticas
    IF expired_count > 0 THEN
        INSERT INTO statistics (date, total_expired)
        VALUES (CURDATE(), expired_count)
        ON DUPLICATE KEY UPDATE total_expired = total_expired + expired_count;

        -- Registrar actividad de expiración
        INSERT INTO activity_logs (user_id, action_type, file_id)
        SELECT user_id, 'expire', id FROM files WHERE expires_at < NOW();
    END IF;

    -- Eliminar archivos expirados
    DELETE FROM files WHERE expires_at < NOW();
END //
DELIMITER ;

-- Evento para ejecutar la limpieza automáticamente cada hora
CREATE EVENT IF NOT EXISTS hourly_cleanup
ON SCHEDULE EVERY 1 HOUR
DO
    CALL cleanup_expired_files();

-- Trigger para actualizar el espacio usado por el usuario al subir un archivo
DELIMITER //
CREATE TRIGGER after_file_insert
AFTER INSERT ON files
FOR EACH ROW
BEGIN
    UPDATE users
    SET storage_used = storage_used + NEW.file_size
    WHERE id = NEW.user_id;
END //
DELIMITER ;

-- Trigger para actualizar el espacio usado por el usuario al eliminar un archivo
DELIMITER //
CREATE TRIGGER after_file_delete
AFTER DELETE ON files
FOR EACH ROW
BEGIN
    UPDATE users
    SET storage_used = storage_used - OLD.file_size
    WHERE id = OLD.user_id;
END //
DELIMITER ;

-- Asegurarse de que los eventos estén habilitados
SET GLOBAL event_scheduler = ON;
