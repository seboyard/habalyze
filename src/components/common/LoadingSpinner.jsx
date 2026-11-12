import React from 'react';
import { motion } from 'framer-motion';

export default function LoadingSpinner({ size = 'medium', message = '' }) {
  const sizeMap = {
    small: 'h-6 w-6',
    medium: 'h-12 w-12',
    large: 'h-16 w-16'
  };

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <motion.div
        className={`${sizeMap[size]} border-4 border-purple-200 border-t-purple-600 rounded-full`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
      {message && (
        <p className="text-gray-500 text-sm mt-4">{message}</p>
      )}
    </div>
  );
}