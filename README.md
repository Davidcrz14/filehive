# FileHive - Plataforma de Compartición de Archivos

FileHive es una aplicación web que permite a los usuarios subir archivos y generar enlaces para compartirlos fácilmente. Los archivos subidos se almacenan temporalmente y se eliminan automáticamente después de un período de tiempo especificado (12 o 24 horas).

## Características principales

- 🔒 Autenticación de usuarios (registro e inicio de sesión)
- 📤 Subida de archivos con límite de 50MB por archivo
- 🔗 Generación de enlaces públicos para compartir archivos
- ⏱️ Eliminación automática de archivos después de 12 o 24 horas
- 📊 Estadísticas sobre tus archivos y descargas
- 🌓 Modo oscuro/claro

## Tecnologías utilizadas

- Frontend: React, TailwindCSS, Framer Motion
- Backend: Node.js, Express
- Base de datos: MySQL
- Herramientas: Vite, Axios, Multer

## Requisitos previos

- Node.js (versión 18 o superior)
- MySQL

## Instalación

1. Clona este repositorio:

```bash
git clone https://github.com/tuusuario/filehive.git
cd filehive
```

2. Instala las dependencias:

```bash
npm install
```

3. Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```
DB_HOST=localhost
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_DATABASE=filehive
JWT_SECRET=tu_clave_secreta_jwt
```

Para generar una clave JWT segura, puedes usar el script incluido:

```bash
node generate-jwt-secret.js
```

4. Crea la base de datos y las tablas necesarias:

```sql
CREATE DATABASE filehive;
USE filehive;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE files (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  file_size BIGINT NOT NULL,
  downloaded_count INT DEFAULT 0,
  download_token VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## Ejecución

Para ejecutar la aplicación en modo desarrollo:

```bash
npm run dev:full
```

Esto iniciará tanto el servidor backend como el frontend de desarrollo.

Para construir la aplicación para producción:

```bash
npm run build
```

## Configuración de la eliminación automática

Los archivos se eliminan automáticamente mediante un proceso programado que se ejecuta cada hora. Este proceso verifica los archivos que han expirado (según la duración seleccionada por el usuario durante la subida) y los elimina tanto de la base de datos como del sistema de archivos.

## Despliegue en Hostinger

Para desplegar esta aplicación en Hostinger, consulta el archivo [DEPLOY_HOSTINGER.md](DEPLOY_HOSTINGER.md) que contiene instrucciones detalladas sobre:

- Configuración de la base de datos en Hostinger
- Configuración del archivo .env para producción
- Generación de una clave JWT segura
- Subida de archivos al servidor
- Configuración de Node.js en Hostinger
- Solución de problemas comunes

## Limitaciones

- Tamaño máximo por archivo: 50MB
- Los archivos se eliminan automáticamente después de 12 o 24 horas
- Se requiere crear una cuenta para subir archivos

## Licencia

Este proyecto está bajo la Licencia DAVC
