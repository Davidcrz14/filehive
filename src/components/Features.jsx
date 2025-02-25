import { motion } from 'framer-motion';

const features = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Compartir Sencillo',
    description: 'Comparte archivos de forma rápida y sencilla con enlaces únicos que puedes enviar a cualquier persona.'
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    title: 'Privacidad Garantizada',
    description: 'Tus archivos se eliminan automáticamente después del tiempo seleccionado, asegurando tu privacidad en todo momento.'
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Archivos Temporales',
    description: 'Elige entre 12 o 24 horas de disponibilidad. Una vez expirado el tiempo, los archivos se eliminan permanentemente.'
  }
];

const Features = () => {
  return (
    <div className="w-full py-16 sm:py-24 relative overflow-hidden">
      {/* Fondo con gradiente */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-purple-50 to-white dark:from-gray-900 dark:via-purple-900/10 dark:to-gray-900"></div>

      {/* Elementos decorativos */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg className="absolute top-0 left-0 w-32 h-32 text-purple-200 dark:text-purple-900/20 opacity-50" viewBox="0 0 200 200" fill="currentColor">
          <path d="M44.5,-76.2C59.1,-69.5,73.2,-60.1,83.1,-47.1C93,-34,98.5,-17,98.3,-0.1C98.1,16.8,92.1,33.5,82.1,47.1C72.1,60.7,58.1,71.2,42.8,77.2C27.5,83.3,10.9,85,-3.9,81.1C-18.8,77.2,-31.9,67.8,-44.8,57.4C-57.8,47,-70.5,35.7,-77.2,21.3C-83.9,6.9,-84.5,-10.5,-79.7,-26.1C-74.9,-41.7,-64.6,-55.4,-51.3,-62.4C-38,-69.5,-21.7,-70,-5.8,-69.8C10.1,-69.7,29.9,-82.9,44.5,-76.2Z" transform="translate(100 100)" />
        </svg>

        <svg className="absolute bottom-0 right-0 w-40 h-40 text-pink-200 dark:text-pink-900/20 opacity-50" viewBox="0 0 200 200" fill="currentColor">
          <path d="M39.9,-68.9C52.6,-62.7,64.4,-53.5,72.8,-41.3C81.2,-29.1,86.1,-14.6,85.4,-0.4C84.7,13.7,78.4,27.4,70,39.4C61.6,51.4,51.1,61.7,38.7,68.5C26.3,75.3,12.1,78.6,-1.9,81.7C-15.9,84.8,-29.9,87.7,-42.3,82.7C-54.8,77.7,-65.8,64.9,-73.7,50.4C-81.5,35.9,-86.3,19.5,-87.2,2.7C-88.1,-14.1,-85.1,-30.6,-76.7,-43.9C-68.3,-57.2,-54.5,-67.3,-40,-71.5C-25.5,-75.7,-10.3,-74,-2.2,-70.2C5.9,-66.4,27.1,-75.1,39.9,-68.9Z" transform="translate(100 100)" />
        </svg>
      </div>

      <div className="w-full px-4 sm:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-gray-900 dark:text-white">
            Características <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Principales</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            FileHive te ofrece una forma segura y eficiente de compartir archivos temporalmente, sin complicaciones.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 max-w-screen-xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 + 0.3, duration: 0.5 }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-100 dark:border-gray-700 flex flex-col h-full"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-2xl flex items-center justify-center mb-6 text-purple-600 dark:text-purple-400">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 flex-grow">{feature.description}</p>

              <motion.div
                className="mt-6 flex items-center text-purple-600 dark:text-purple-400 font-medium"
                whileHover={{ x: 5 }}
              >
              </motion.div>
            </motion.div>
          ))}
        </div>


      </div>
    </div>
  );
};

export default Features;
