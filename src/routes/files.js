import crypto from "crypto";
import dotenv from "dotenv";
import express from "express";
import fs from "fs";
import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import pool from "../config/db.js";
import authMiddleware from "../middleware/auth.js";

dotenv.config();

const router = express.Router();

// Configuración de la URL base
const API_URL = process.env.API_URL || "http://localhost:5000";

// Crear el directorio de uploads si no existe
const uploadDir = "src/uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Función para generar un token seguro
const generateSecureToken = () => {
  const randomBytes = crypto.randomBytes(32).toString("hex");
  const timestamp = Date.now().toString(36);
  const uuid = uuidv4();
  return `${randomBytes}-${timestamp}-${uuid}`;
};

// Configurar multer para el almacenamiento de archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueFileName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueFileName);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
});

// Obtener estadísticas del usuario
router.get("/stats", authMiddleware, async (req, res) => {
  try {
    const [stats] = await pool.query(
      `
            SELECT
                COUNT(*) as totalUploads,
                SUM(CASE WHEN expires_at > NOW() THEN 1 ELSE 0 END) as activeLinks,
                SUM(downloaded_count) as totalDownloads,
                SUM(file_size) as totalSize
            FROM files
            WHERE user_id = ?
        `,
      [req.user.id]
    );

    const totalSizeMB = Math.round((stats[0].totalSize || 0) / (1024 * 1024));
    const storageLimit = 50; // 50MB

    res.json({
      totalUploads: stats[0].totalUploads || 0,
      activeLinks: stats[0].activeLinks || 0,
      totalDownloads: stats[0].totalDownloads || 0,
      storageUsed: `${totalSizeMB} MB`,
      storageLimit: `${storageLimit} MB`,
      storageAvailable: `${storageLimit - totalSizeMB} MB`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener estadísticas" });
  }
});

// Subir archivos
router.post(
  "/upload",
  authMiddleware,
  upload.array("files"),
  async (req, res) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const { duration } = req.body;
      const hours = parseInt(duration) || 12;

      const results = await Promise.all(
        req.files.map(async (file) => {
          const downloadToken = generateSecureToken();
          const uniqueFileName = `${req.user.id}-${Date.now()}-${
            file.originalname
          }`;

          // Renombrar el archivo físico
          const oldPath = path.join(uploadDir, file.filename);
          const newPath = path.join(uploadDir, uniqueFileName);
          fs.renameSync(oldPath, newPath);

          const [result] = await connection.query(
            `INSERT INTO files
            (user_id, original_name, file_path, file_size, expires_at, download_token)
            VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL ? HOUR), ?)`,
            [
              req.user.id,
              file.originalname,
              uniqueFileName,
              file.size,
              hours,
              downloadToken,
            ]
          );

          return {
            id: result.insertId,
            name: file.originalname,
            link: `${API_URL}/api/files/download/${downloadToken}`,
            expires_in: `${hours} hours`,
          };
        })
      );

      await connection.commit();
      res.status(201).json(results);
    } catch (error) {
      await connection.rollback();
      console.error("Error en la subida:", error);

      // Limpiar archivos subidos en caso de error
      req.files?.forEach((file) => {
        const filePath = path.join(uploadDir, file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });

      res.status(500).json({
        error: "Error al subir archivos",
        details: error.message,
      });
    } finally {
      connection.release();
    }
  }
);

// Obtener lista de archivos del usuario
router.get("/", authMiddleware, async (req, res) => {
  try {
    const [files] = await pool.query(
      `
            SELECT id, original_name as name, file_size as size, downloaded_count as downloads,
            DATE_FORMAT(expires_at, '%Y-%m-%d %H:%i:%s') as expires, download_token
            FROM files
            WHERE user_id = ? AND expires_at > NOW()
            ORDER BY created_at DESC
        `,
      [req.user.id]
    );

    const filesWithLinks = files.map((file) => ({
      ...file,
      size: `${Math.round(file.size / (1024 * 1024))} MB`,
      link: `${API_URL}/api/files/download/${file.download_token}`,
    }));

    res.json(filesWithLinks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener archivos" });
  }
});

// Descargar archivo
router.get("/download/:token", async (req, res) => {
  try {
    const token = req.params.token;

    // Validar que el token tenga un formato válido
    if (!token || token.length < 32) {
      return res.status(400).json({ error: "Token de descarga inválido" });
    }

    const [files] = await pool.query(
      "SELECT * FROM files WHERE download_token = ? AND expires_at > NOW()",
      [token]
    );

    if (files.length === 0) {
      return res.status(404).json({
        error: "Archivo no encontrado o enlace expirado",
        message:
          "El archivo que intentas descargar ya no está disponible o el enlace ha expirado",
      });
    }

    const file = files[0];
    const filePath = path.join(uploadDir, file.file_path);

    if (!fs.existsSync(filePath)) {
      // Si el archivo físico no existe, eliminamos el registro de la base de datos
      await pool.query("DELETE FROM files WHERE id = ?", [file.id]);
      return res.status(404).json({
        error: "Archivo no encontrado",
        message: "El archivo físico ya no existe en el servidor",
      });
    }

    // Incrementar contador de descargas
    await pool.query(
      "UPDATE files SET downloaded_count = downloaded_count + 1 WHERE id = ?",
      [file.id]
    );

    // Configurar headers para la descarga
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(file.original_name)}"`
    );
    res.setHeader("Content-Type", "application/octet-stream");

    // Enviar el archivo
    res.download(filePath, file.original_name);
  } catch (error) {
    console.error("Error en la descarga:", error);
    res.status(500).json({
      error: "Error al descargar archivo",
      message: "Ocurrió un error al intentar descargar el archivo",
    });
  }
});

// Ruta para manejar solicitudes a /api/files/download sin token
router.get("/download", (req, res) => {
  res
    .status(404)
    .json({ error: "No se especificó un token de descarga válido" });
});

// Eliminar archivo
router.delete("/:id", authMiddleware, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [files] = await connection.query(
      "SELECT * FROM files WHERE id = ? AND user_id = ?",
      [req.params.id, req.user.id]
    );

    if (files.length === 0) {
      return res.status(404).json({ error: "Archivo no encontrado" });
    }

    const file = files[0];
    const filePath = path.join(uploadDir, file.file_path);

    // Eliminar registro de la base de datos primero
    await connection.query("DELETE FROM files WHERE id = ?", [file.id]);

    // Eliminar archivo físico
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await connection.commit();
    res.json({ message: "Archivo eliminado correctamente" });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ error: "Error al eliminar archivo" });
  } finally {
    connection.release();
  }
});

export default router;
