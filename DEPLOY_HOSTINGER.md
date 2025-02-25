# Guía de Despliegue en Hostinger

Esta guía te ayudará a desplegar FileHive en Hostinger paso a paso.

## 1. Preparación de la Base de Datos

1. Accede al panel de control de Hostinger
2. Ve a la sección "Bases de datos MySQL"
3. Crea una nueva base de datos:
   - Nombre de la base de datos: `filehive` (o el nombre que prefieras)
   - Usuario: crea un nuevo usuario
   - Contraseña: genera una contraseña segura
4. Guarda esta información para usarla en la configuración

## 2. Configuración del Archivo .env

Edita el archivo `.env` con la información de tu base de datos en Hostinger:

```
# Configuración de la base de datos
DB_HOST=localhost
DB_USER=tu_usuario_db_hostinger
DB_PASSWORD=tu_contraseña_db_hostinger
DB_DATABASE=tu_nombre_db_hostinger

# Configuración de JWT
JWT_SECRET=genera_una_clave_aleatoria_larga_y_compleja

# URL de la API (utilizada para generar enlaces de descarga)
VITE_API_URL=https://tu-dominio.com

# Puerto del servidor
PORT=3000
```

### Sobre el JWT_SECRET

El `JWT_SECRET` es una clave secreta utilizada para firmar y verificar los tokens de autenticación. Es crucial para la seguridad de tu aplicación:

- **NUNCA uses la clave de ejemplo**
- **Genera una clave aleatoria fuerte** (mínimo 32 caracteres)
- Puedes generar una clave segura con este comando:
  ```
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- **Mantén esta clave en secreto** y no la compartas

## 3. Construcción de la Aplicación

Antes de subir la aplicación a Hostinger, debes construir la versión de producción:

```bash
npm run build
```

Esto creará una carpeta `dist` con los archivos optimizados para producción.

## 4. Configuración de Node.js en Hostinger

1. Accede al panel de control de Hostinger
2. Ve a la sección "Website" > tu dominio > "Node.js"
3. Activa Node.js para tu dominio
4. Configura el punto de entrada: `server.js`
5. Selecciona la versión de Node.js (recomendado: 18.x o superior)
6. Guarda la configuración

## 5. Subida de Archivos

1. Conecta a tu hosting mediante FTP o el Administrador de Archivos de Hostinger
2. Sube todos los archivos de tu proyecto, incluyendo:
   - La carpeta `dist` (archivos frontend compilados)
   - `server.js` y demás archivos del backend
   - `package.json` y `package-lock.json`
   - El archivo `.env` configurado
   - Las carpetas `src` necesarias para el backend

## 6. Instalación de Dependencias

Desde la terminal SSH de Hostinger:

```bash
cd tu-directorio
npm install --production
```

## 7. Creación de las Tablas de la Base de Datos

1. Accede a phpMyAdmin desde el panel de Hostinger
2. Selecciona tu base de datos
3. Ve a la pestaña "SQL" y ejecuta el siguiente script:

```sql
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

## 8. Configuración del Directorio de Uploads

Asegúrate de que el directorio `src/uploads` exista y tenga permisos de escritura:

```bash
mkdir -p src/uploads
chmod 755 src/uploads
```

## 9. Configuración de PM2 (Opcional pero Recomendado)

Para mantener tu aplicación en ejecución permanentemente:

```bash
npm install -g pm2
pm2 start server.js --name "filehive"
pm2 save
pm2 startup
```

## 10. Configuración del Dominio

1. En el panel de Hostinger, configura tu dominio para que apunte a tu aplicación Node.js
2. Configura HTTPS para tu dominio (muy recomendado para seguridad)

## 11. Verificación

1. Visita tu dominio en el navegador
2. Registra una cuenta de prueba
3. Verifica que puedas subir y compartir archivos
4. Comprueba que los enlaces de descarga funcionen correctamente

## Solución de Problemas Comunes

### Error de Conexión a la Base de Datos

- Verifica las credenciales en el archivo `.env`
- Asegúrate de que el usuario tenga permisos en la base de datos

### Error "Cannot find module"

- Verifica que todas las dependencias estén instaladas: `npm install`

### Problemas con los Permisos de Archivos

- Asegúrate de que el directorio `src/uploads` tenga permisos de escritura

### La Limpieza Automática No Funciona

- Verifica los logs de la aplicación
- Asegúrate de que el servidor tenga permisos para eliminar archivos

## Mantenimiento

- Revisa regularmente los logs de la aplicación
- Monitorea el uso del disco para evitar quedarte sin espacio
- Considera implementar copias de seguridad de la base de datos
