import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Link } from 'wouter';

interface AnimatedMenuItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

export function AnimatedMenuItem({
  href,
  icon,
  label,
  isActive = false,
  onClick,
  className,
}: AnimatedMenuItemProps) {
  // Animation variants
  const containerVariants = {
    initial: { opacity: 0.9, y: 0 },
    hover: { opacity: 1, y: -2, transition: { duration: 0.2 } },
    tap: { scale: 0.98, transition: { duration: 0.1 } },
  };

  const iconVariants = {
    initial: { scale: 1, rotate: 0 },
    hover: { scale: 1.1, rotate: isActive ? 0 : 5, transition: { duration: 0.2 } },
  };

  const backdropVariants = {
    initial: { opacity: 0, scale: 0.95 },
    hover: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
  };

  const indicatorVariants = {
    initial: { opacity: isActive ? 1 : 0, x: isActive ? 0 : 10 },
    hover: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  };

  return (
    <Link href={href}>
      <motion.div
        className={cn(
          "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm cursor-pointer overflow-hidden",
          isActive
            ? "bg-primary/10 text-primary font-medium"
            : "text-foreground hover:bg-accent/30",
          className
        )}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        variants={containerVariants}
        onClick={onClick}
      >
        {/* Hover backdrop effect */}
        {!isActive && (
          <motion.div
            className="absolute inset-0 bg-accent/20 rounded-lg"
            variants={backdropVariants}
            initial={{ opacity: 0 }}
            animate="initial"
          />
        )}

        {/* Active state indicator */}
        <motion.div
          className="absolute right-0 top-0 bottom-0 w-1 bg-primary rounded-l-lg"
          variants={indicatorVariants}
          initial="initial"
          animate="initial"
        />

        {/* Icon with animation */}
        <motion.div
          className={cn(
            "relative z-10",
            isActive ? "text-primary" : "text-muted-foreground"
          )}
          variants={iconVariants}
        >
          {icon}
        </motion.div>

        {/* Label */}
        <span className="relative z-10">
          {label}
        </span>
      </motion.div>
    </Link>
  );
}

export default AnimatedMenuItem;