import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

const BOUNCE = { type: 'spring', stiffness: 500, damping: 18, mass: 0.6 };

const VARIANTS = {
  gold:  'bg-neu-gold text-neu-black border-neu-black',
  black: 'bg-neu-black text-neu-white border-neu-black',
  ghost: 'bg-transparent text-neu-black border-neu-black',
};

/**
 * Tombol "mekanis": terangkat dengan shadow solid saat idle/hover, turun rata +
 * shadow hilang saat ditekan. Spring bouncy (bukan CSS transition biasa) untuk
 * kesan tactile 3D sesuai brief.
 */
export function TactileButton({ children, variant = 'gold', className = '', as: As = 'button', ...props }) {
  return (
    <motion.div
      className="inline-block rounded-neu"
      initial={{ x: -3, y: -3, boxShadow: '4px 4px 0px #0D0D0D' }}
      animate={{ x: -3, y: -3, boxShadow: '4px 4px 0px #0D0D0D' }}
      whileHover={{ x: -4, y: -4, boxShadow: '5px 5px 0px #0D0D0D' }}
      whileTap={{ x: 0, y: 0, boxShadow: '0px 0px 0px #0D0D0D' }}
      transition={BOUNCE}
    >
      <As
        className={cn(
          'inline-flex items-center justify-center gap-2 px-6 py-3 border-2 rounded-neu font-display font-bold text-sm uppercase tracking-wide',
          VARIANTS[variant],
          className,
        )}
        {...props}
      >
        {children}
      </As>
    </motion.div>
  );
}
