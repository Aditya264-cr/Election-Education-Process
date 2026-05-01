import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../Atoms/Icon';

const Drawer = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  side = 'right',
  footerBadge = false,
}) => {
  useEffect(() => {
    // We don't disable scroll on body to maintain map interactivity if needed,
    // but the overlay will handle click-away.
  }, [isOpen]);

  const variants = {
    right: { x: '100%' },
    left: { x: '-100%' },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Subtle Overlay to maintain map focus without heavy darkening */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/10 backdrop-blur-[2px] z-[3000]"
          />
          <motion.div
            initial={variants[side]}
            animate={{ x: 0 }}
            exit={variants[side]}
            transition={{ type: 'spring', damping: 30, stiffness: 250 }}
            className={`fixed top-0 ${side}-0 h-full w-full max-w-md bg-white/95 backdrop-blur-xl shadow-[-20px_0_50px_rgba(0,0,0,0.1)] z-[3001] flex flex-col border-l border-white/20`}
          >
            {/* 8pt Grid Header: 24px (3*8) padding */}
            <div className="flex items-center justify-between p-6 md:p-8 border-b border-slate-100/50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-200">
                  <Icon name="Building2" size={24} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h2>
              </div>
              <button 
                onClick={onClose}
                className="p-3 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all active:scale-90"
              >
                <Icon name="X" size={24} />
              </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 scrollbar-hide">
              {children}
            </div>

            {/* MNC-Grade Footer with Authorization Badge */}
            <div className="p-6 md:p-8 bg-slate-50/50 border-t border-slate-100">
              {footerBadge && (
                <div className="flex flex-col gap-4">
                   <div className="flex items-center gap-3 py-3 px-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
                      <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                        <Icon name="ShieldCheck" size={18} />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Authorization</p>
                        <p className="text-xs font-bold text-slate-700 leading-tight">Verified by Constitution of India</p>
                      </div>
                      <a 
                        href="/api/law-library/docs/constitution-article-104" 
                        target="_blank"
                        className="p-2 hover:bg-slate-50 rounded-lg text-blue-600 transition-colors"
                        title="View Legal Basis"
                      >
                        <Icon name="FileText" size={18} />
                      </a>
                   </div>
                   <p className="text-[10px] text-slate-400 text-center font-medium">
                     Civic Intelligence Protocol v2.0 • Deterministic LGD-Linkage Active
                   </p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Drawer;

