/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { Check, Info } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

export interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'info';
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 pointer-events-none max-w-sm w-full px-4" id="toast-container">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onRemove={onRemove} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastCard({ toast, onRemove }: { key?: string; toast: ToastItem; onRemove: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, 2500);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
      className="flex items-center gap-3 bg-white border border-[#e5e5e5] px-4 py-3 rounded-lg shadow-sm pointer-events-auto"
      id={`toast-${toast.id}`}
    >
      {toast.type === 'success' ? (
        <Check className="w-4 h-4 text-[#8fa385] flex-shrink-0" id={`toast-icon-${toast.id}`} />
      ) : (
        <Info className="w-4 h-4 text-[#6b8a9e] flex-shrink-0" id={`toast-icon-${toast.id}`} />
      )}
      <span className="text-xs font-medium text-neutral-800" id={`toast-msg-${toast.id}`}>{toast.message}</span>
    </motion.div>
  );
}
