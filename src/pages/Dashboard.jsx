import axios from 'axios';
import { motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';

const Dashboard = () => {
  const [files, setFiles] = useState([]);
  const [duration, setDuration] = useState(12);
  const [uploadHistory, setUploadHistory] = useState([]);
  const [stats, setStats] = useState({
    totalUploads: 0,
    activeLinks: 0,
    totalDownloads: 0,
    storageUsed: '0 MB',
    storageLimit: '50 MB',
    storageAvailable: '50 MB'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [statsRes, filesRes] = await Promise.all([
          axios.get('/api/files/stats', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('/api/files', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        setStats(statsRes.data);
        setUploadHistory(filesRes.data);
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const onDrop = useCallback(acceptedFiles => {
    const validFiles = acceptedFiles.filter(file => file.size <= 50 * 1024 * 1024);
    if (validFiles.length < acceptedFiles.length) {
      alert('Algunos archivos exceden el límite de 50MB');
    }
    setFiles(prevFiles => [...prevFiles, ...validFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 50 * 1024 * 1024
  });

  const handleUpload = async () => {
    if (files.length === 0) return;

    try {
      const token = localStorage.getItem('token');
      console.log('Token actual:', token); // Debug
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));
      formData.append('duration', duration);

      console.log('Enviando petición con token:', `Bearer ${token}`); // Debug
      const response = await axios.post('/api/files/upload', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.status === 201) {
        setFiles([]);
        // Actualizar datos
        const [statsRes, filesRes] = await Promise.all([
          axios.get('/api/files/stats', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('/api/files', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        setStats(statsRes.data);
        setUploadHistory(filesRes.data);
      }
    } catch (error) {
      if (error.response?.data?.error === 'Espacio insuficiente') {
        alert('No tienes suficiente espacio. Por favor, elimina algunos archivos.');
      } else {
        console.error('Error al subir archivos:', error);
        alert('Error al subir los archivos');
      }
    }
  };

  const handleDelete = async (fileId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/files/${fileId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Actualizar datos
      const [statsRes, filesRes] = await Promise.all([
        axios.get('/api/files/stats', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('/api/files', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setStats(statsRes.data);
      setUploadHistory(filesRes.data);
    } catch (error) {
      console.error('Error al eliminar archivo:', error);
      alert('Error al eliminar el archivo');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Enlace copiado al portapapeles');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-20">
      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm"
        >
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Archivos Subidos</h3>
          <p className="text-2xl font-semibold dark:text-white">{stats.totalUploads}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm"
        >
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Enlaces Activos</h3>
          <p className="text-2xl font-semibold dark:text-white">{stats.activeLinks}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm"
        >
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Descargas Totales</h3>
          <p className="text-2xl font-semibold dark:text-white">{stats.totalDownloads}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm"
        >
          <div className="flex flex-col">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Almacenamiento</h3>
            <p className="text-2xl font-semibold dark:text-white">{stats.storageUsed}</p>
            <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2.5 rounded-full"
                style={{
                  width: `${(parseFloat(stats.storageUsed) / parseFloat(stats.storageLimit)) * 100}%`
                }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Disponible: {stats.storageAvailable}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Área de subida de archivos */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm mb-8"
      >
        <h2 className="text-2xl font-semibold mb-6 dark:text-white">Subir Archivos</h2>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed p-8 rounded-lg text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500'}`}
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <p className="text-purple-500">Suelta los archivos aquí...</p>
          ) : (
            <div>
              <p className="mb-2 dark:text-white">Arrastra archivos aquí o haz clic para seleccionar</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Máximo 50MB por archivo</p>
            </div>
          )}
        </div>

        {/* Lista de archivos seleccionados */}
        {files.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-4 dark:text-white">Archivos seleccionados:</h3>
            <div className="space-y-2">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded">
                      <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium dark:text-white">{file.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setFiles(files.filter((_, i) => i !== index))}
                    className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Opciones de subida */}
        <div className="mt-6 flex items-center space-x-4">
          <select
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-700 dark:text-white dark:bg-gray-700 dark:border-gray-600"
          >
            <option value={12}>12 horas</option>
            <option value={24}>24 horas</option>
          </select>

          <button
            onClick={handleUpload}
            disabled={files.length === 0}
            className={`px-6 py-2 rounded-lg ${
              files.length === 0
                ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg transition-shadow'
            }`}
          >
            Subir Archivos
          </button>
        </div>
      </motion.div>

      {/* Historial de archivos */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm"
      >
        <h2 className="text-2xl font-semibold mb-6 dark:text-white">Historial de Archivos</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b dark:border-gray-700">
                <th className="text-left py-4 px-4 text-gray-500 dark:text-gray-400">Archivo</th>
                <th className="text-left py-4 px-4 text-gray-500 dark:text-gray-400">Tamaño</th>
                <th className="text-left py-4 px-4 text-gray-500 dark:text-gray-400">Descargas</th>
                <th className="text-left py-4 px-4 text-gray-500 dark:text-gray-400">Expira</th>
                <th className="text-left py-4 px-4 text-gray-500 dark:text-gray-400">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {uploadHistory.map((file) => (
                <tr key={file.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="py-4 px-4 dark:text-white">{file.name}</td>
                  <td className="py-4 px-4 dark:text-white">{file.size}</td>
                  <td className="py-4 px-4 dark:text-white">{file.downloads}</td>
                  <td className="py-4 px-4 dark:text-white">{file.expires}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => copyToClipboard(file.link)}
                        className="text-purple-500 hover:text-purple-600 dark:text-purple-400 dark:hover:text-purple-300"
                      >
                        Copiar enlace
                      </button>
                      <button
                        onClick={() => handleDelete(file.id)}
                        className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
