import { motion } from 'framer-motion';
import logo from '/logo.png';

const Hero = () => {
  return (
    <div className="w-full min-h-[calc(100vh-80px)] flex items-center overflow-hidden relative">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-64 h-64 rounded-full bg-purple-300/20 dark:bg-purple-900/20 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 20, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-pink-300/20 dark:bg-pink-900/20 blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -30, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
      </div>

      <div className="w-full px-4 sm:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-screen-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="flex flex-col justify-center text-center md:text-left"
          >
            <div className="mb-2">
              <motion.span
                className="inline-block px-4 py-1.5 bg-gradient-to-r from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium mb-4"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                Compartir nunca fue tan fácil
              </motion.span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-gray-900 dark:text-white">
              <motion.span
                className="block"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
              >
                Comparte archivos
              </motion.span>
              <motion.span
                className="block bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                de forma Segura
              </motion.span>
              <motion.span
                className="block"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                y Temporal
              </motion.span>
            </h1>

            <motion.p
              className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              Sube archivos de hasta <span className="font-semibold text-purple-600 dark:text-purple-400">50MB</span> con una expiración automática de <span className="font-semibold text-pink-600 dark:text-pink-400">12 o 24 horas</span>.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
            >
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(147, 51, 234, 0.5)" }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl shadow-lg transition-all text-lg font-medium"
              >
                Comenzar ahora
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-all text-lg font-medium"
              >
                Saber más
              </motion.button>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="relative hidden md:flex items-center justify-center"
          >
            <motion.div
              className="relative z-10 w-full flex items-center justify-center p-4"
              whileHover={{ rotate: -2, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.img
                src={logo}
                alt="FileHive Logo"
                className="w-auto h-auto"
                style={{
                  maxWidth: '95%',
                  minWidth: '350px',
                  maxHeight: '500px',
                  objectFit: 'contain'
                }}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
