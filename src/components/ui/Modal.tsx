'use client';

import { ReactNode, useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function Modal({ isOpen, onClose, children }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[2000] bg-black/60 backdrop-blur-[10px] animate-[fadeIn_0.3s]"
      onClick={onClose}
    >
      <div 
        className="relative bg-[var(--surface)] mx-auto mt-[10%] p-14 rounded-[18px] w-[90%] max-w-[480px] animate-[slideUp_0.4s_cubic-bezier(0.4,0,0.2,1)] shadow-[0_40px_80px_rgba(0,0,0,0.3)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute right-6 top-6 text-[var(--text-secondary)] text-[28px] cursor-pointer hover:text-[var(--text-primary)] transition-colors"
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
}
