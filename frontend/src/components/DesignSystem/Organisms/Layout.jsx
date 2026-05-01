import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../../hooks/useLanguage';
import { useKidsMode } from '../../../hooks/useKidsMode';
import LanguageSwitcher from '../Atoms/LanguageSwitcher';
import KidsModeToggle from '../Atoms/KidsModeToggle';
import Icon from '../Atoms/Icon';

const Layout = ({ 
  children, 
  navItems = [], 
  onNavItemClick,
  highContrast,
  onContrastToggle 
}) => {
  const { t } = useLanguage();
  const { isKidsMode } = useKidsMode();

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-50">
      <header className="flex items-center justify-between px-8 py-4 glass-panel z-50">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-blue-600 rounded-lg text-white">
            <Icon name={isKidsMode ? 'Castle' : 'Home'} size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 leading-tight">{t('app_title')}</h1>
            <p className="text-sm text-slate-500">{t('app_subtitle')}</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavItemClick(item.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                item.active 
                ? 'bg-blue-100 text-blue-700 font-semibold' 
                : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon name={item.icon} size={18} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <button
            onClick={onContrastToggle}
            className={`p-2 rounded-lg transition-colors ${
              highContrast ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Icon name="Contrast" size={20} />
          </button>
          <KidsModeToggle />
          <LanguageSwitcher />
        </div>
      </header>

      <main className="flex-1 relative overflow-hidden">
        {children}
      </main>

      <footer className="px-8 py-2 bg-slate-900 text-slate-400 text-xs flex justify-between items-center z-50">
        <span>© 2026 Friendly Neighbor Civic AI</span>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Icon name="ShieldCheck" size={12} className="text-emerald-500" />
            Neighbor Verified
          </span>
          <span>{t('disclaimer')}</span>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
