import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

export default function GlassCard({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      className={`glass-card p-6 ${className}`}
    >
      {children}
    </motion.div>
  );
}
