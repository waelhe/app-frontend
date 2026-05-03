'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, PenLine, UserPlus, Search } from 'lucide-react';
import { useLanguage } from '@/store/use-language';
import { useAuth } from '@/store/use-auth';
import { useNavigationStore } from '@/stores/navigationStore';

export function FloatingActionButton() {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const { navigate } = useNavigationStore();
  const [isOpen, setIsOpen] = useState(false);

  const handleMainClick = () => {
    if (isAuthenticated) {
      // Directly navigate to create listing
      navigate('create-listing');
    } else {
      setIsOpen(!isOpen);
    }
  };

  const actions = isAuthenticated ? [] : [
    {
      icon: PenLine,
      label: t('إنشاء حساب', 'Sign Up'),
      gradient: 'from-emerald-500 to-teal-600',
      onClick: () => {
        window.dispatchEvent(new CustomEvent('open-login', { detail: { mode: 'register' } }));
        setIsOpen(false);
      },
    },
    {
      icon: Search,
      label: t('تسجيل الدخول', 'Log In'),
      gradient: 'from-blue-500 to-cyan-600',
      onClick: () => {
        window.dispatchEvent(new CustomEvent('open-login', { detail: { mode: 'login' } }));
        setIsOpen(false);
      },
    },
  ];

  if (isAuthenticated && actions.length === 0) {
    // Authenticated user — single FAB for posting
    return (
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.5 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleMainClick}
        className="fixed bottom-24 right-5 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/30 flex items-center justify-center"
        aria-label={t('إضافة إعلان', 'Post Ad')}
      >
        <Plus className="h-6 w-6" />
      </motion.button>
    );
  }

  // Guest user — expandable FAB
  return (
    <div className="fixed bottom-24 right-5 z-40 flex flex-col-reverse items-end gap-3">
      {/* Sub-actions */}
      <AnimatePresence>
        {isOpen && actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.8 }}
              transition={{ delay: index * 0.08, duration: 0.2 }}
              className="flex items-center gap-2"
            >
              <span className="bg-white/95 backdrop-blur-sm text-gray-700 text-xs font-medium px-3 py-1.5 rounded-lg shadow-sm whitespace-nowrap">
                {action.label}
              </span>
              <button
                onClick={action.onClick}
                className={`w-11 h-11 rounded-full bg-gradient-to-br ${action.gradient} text-white shadow-md flex items-center justify-center hover:shadow-lg transition-shadow`}
              >
                <Icon className="h-5 w-5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.5 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleMainClick}
        className={`w-14 h-14 rounded-full bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/30 flex items-center justify-center`}
        aria-label={t('إضافة إعلان', 'Post Ad')}
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
        </motion.div>
      </motion.button>
    </div>
  );
}
