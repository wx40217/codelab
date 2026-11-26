import { AnimatePresence, motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

interface ToastProps {
  message: string | null;
}

export function Toast({ message }: ToastProps) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          role="status"
          aria-live="polite"
          className="toast"
          initial={{ opacity: 0, y: -12, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: -10, x: '-50%' }}
          transition={{ duration: 0.2, ease: [0.2, 0.7, 0.2, 1] }}
        >
          <span className="toast__icon" aria-hidden="true">
            <Sparkles size={14} strokeWidth={2.2} />
          </span>
          <span>{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
