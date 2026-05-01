import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../Atoms/Icon';

const Drawer = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  side = 'right' 
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const variants = {
    right: { x: '100%' },
    left: { x: '-100%' },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[3000]"
          />
          <motion.div
            initial={variants[side]}
            animate={{ x: 0 }}
            exit={variants[side]}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed top-0 ${side}-0 h-full w-full max-w-md bg-white shadow-2xl z-[3001] flex flex-col`}
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">{title}</h2>
              <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
              >
                <Icon name="X" size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Drawer;
