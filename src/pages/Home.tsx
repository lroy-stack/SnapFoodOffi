import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LanguageContext } from '../context/LanguageContext';

const Home: React.FC = () => {
  const { t } = useTranslation();
  const { language } = useContext(LanguageContext);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delay: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero section with background image */}
      <div 
        className="relative flex-1 flex flex-col items-center justify-center text-center text-white p-6"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('https://images.pexels.com/photos/5718071/pexels-photo-5718071.jpeg?auto=compress&cs=tinysrgb&h=1080&w=1920')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <motion.div
          className="max-w-3xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1 
            className="text-4xl md:text-5xl font-bold mb-4"
            variants={itemVariants}
          >
            {t('welcome.heading')}
          </motion.h1>
          
          <motion.p 
            className="text-lg md:text-xl mb-8 opacity-90"
            variants={itemVariants}
          >
            {t('welcome.subheading')}
          </motion.p>
          
          <motion.div variants={itemVariants}>
            <Link 
              to="/discover" 
              className="inline-block bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-8 rounded-full text-lg transition-colors"
            >
              {t('welcome.getStarted')}
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;