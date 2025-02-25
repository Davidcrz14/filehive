import fs from "fs";
import path from "path";
import pool from "./db.js";

/**
 * Elimina archivos expirados de la base de datos y del sistema de archivos
 */
export async function cleanupExpiredFiles() {
  console.log("Iniciando limpieza de archivos expirados...");
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Obtener los archivos expirados
    const [expiredFiles] = await connection.query(
      "SELECT id, file_path FROM files WHERE expires_at < NOW()"
    );

    if (expiredFiles.length === 0) {
      console.log("No hay archivos expirados para eliminar");
      return;
    }

    console.log(`Se encontraron ${expiredFiles.length} archivos expirados`);

    // Eliminar cada archivo físico
    const uploadDir = "src/uploads";
    for (const file of expiredFiles) {
      const filePath = path.join(uploadDir, file.file_path);

      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`Archivo eliminado: ${filePath}`);
        }
      } catch (error) {
        console.error(`Error al eliminar archivo ${filePath}:`, error);
      }
    }

    // Eliminar registros de la base de datos
    const fileIds = expiredFiles.map((file) => file.id);
    if (fileIds.length > 0) {
      await connection.query("DELETE FROM files WHERE id IN (?)", [fileIds]);
      console.log(`${fileIds.length} registros eliminados de la base de datos`);
    }

    await connection.commit();
    console.log("Limpieza de archivos expirados completada");
  } catch (error) {
    await connection.rollback();
    console.error("Error durante la limpieza de archivos:", error);
  } finally {
    connection.release();
  }
}

export default cleanupExpiredFiles;
