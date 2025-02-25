import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import cleanupExpiredFiles from "./src/config/cleanup.js";
import authRoutes from "./src/routes/auth.js";
import fileRoutes from "./src/routes/files.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/files", fileRoutes);

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Algo salió mal!" });
});

// Programar la limpieza automática de archivos expirados
// Ejecutar cada hora (3600000 ms)
const CLEANUP_INTERVAL = 3600000; // 1 hora
setInterval(cleanupExpiredFiles, CLEANUP_INTERVAL);
console.log(
  `Limpieza automática programada cada ${CLEANUP_INTERVAL / 60000} minutos`
);

// Ejecutar la limpieza inicial al iniciar el servidor
cleanupExpiredFiles().catch((err) => {
  console.error("Error en la limpieza inicial de archivos:", err);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
