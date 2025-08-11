import React from 'react';
import { motion, Variants } from 'framer-motion';

// Gradient colors
export const AUTH_GRADIENT = 'bg-gradient-to-r from-[#a259ff] via-[#377dff] to-[#43e7ad]';
export const AUTH_CARD_BG = 'bg-[#18182c]/80 backdrop-blur-lg border border-[#23233a] shadow-xl';
export const AUTH_INPUT_BG = 'bg-[#23233a]/60';
export const AUTH_INPUT_PLACEHOLDER = 'placeholder-[#b0b0d0]';
export const AUTH_INPUT_FOCUS = 'focus:outline-none focus:ring-2 focus:ring-[#a259ff]';
export const AUTH_LABEL = 'block text-sm font-medium text-[#b0b0d0] mb-2';
export const AUTH_TEXT_PRIMARY = 'text-3xl font-bold text-white';
export const AUTH_TEXT_SECONDARY = 'text-base text-[#b0b0d0]';
export const AUTH_ERROR = 'mt-1 text-sm text-red-400 flex items-center';
export const AUTH_BUTTON = `w-full py-3 rounded-xl font-semibold text-lg flex items-center justify-center transition-all ${AUTH_GRADIENT} text-white shadow-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#a259ff] mt-2`;

// Framer Motion variants for card/modal
export const authCardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

// Card container for auth modals
export const AuthCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <motion.div
    initial="hidden"
    animate="visible"
    variants={authCardVariants}
    className={`p-8 rounded-2xl ${AUTH_CARD_BG} ${className || ''}`}
  >
    {children}
  </motion.div>
);

// Shared input style
export const authInputClass = `w-full pl-12 pr-4 py-3 rounded-xl ${AUTH_INPUT_BG} text-white ${AUTH_INPUT_PLACEHOLDER} ${AUTH_INPUT_FOCUS} text-base`;

// Shared select style
export const authSelectClass = `w-full pl-4 pr-4 py-3 rounded-xl ${AUTH_INPUT_BG} text-white ${AUTH_INPUT_PLACEHOLDER} ${AUTH_INPUT_FOCUS} text-base`;

// Shared button style
export const authButtonClass = AUTH_BUTTON; 