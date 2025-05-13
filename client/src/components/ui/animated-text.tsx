import React, { useState, useEffect } from 'react';
import { motion, Variants, HTMLMotionProps } from 'framer-motion';
import { cn } from "@/lib/utils";

type AnimatedTextProps = {
  text: string;
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
  type?: 'words' | 'chars' | 'lines';
  animation?: 'fade' | 'slide-up' | 'slide-down' | 'wave' | 'typing' | 'bounce' | 'highlight';
  tag?: keyof JSX.IntrinsicElements;
  threshold?: number;
} & Omit<HTMLMotionProps<'div'>, 'variants'>;

export const AnimatedText: React.FC<AnimatedTextProps> = ({
  text,
  delay = 0,
  duration = 0.05,
  className,
  once = true,
  type = 'words',
  animation = 'fade',
  tag: Tag = 'div',
  threshold = 0.1,
  ...props
}) => {
  const [inView, setInView] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    setInView(true);
  }, []);

  // Split text into appropriate elements
  const renderTextElements = () => {
    const items = createTextItems(text, type);
    let variants = getAnimationVariants(animation);

    return (
      <motion.div
        className={cn('inline-block', className)}
        onAnimationComplete={() => setAnimationComplete(true)}
        {...props}
      >
        {items.map((item, i) => (
          <motion.span
            key={i}
            className={cn(
              'inline-block',
              animation === 'wave' && 'origin-bottom',
              animation === 'highlight' && 'relative',
            )}
            custom={i}
            variants={variants}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            transition={{
              delay: delay + i * duration,
              duration: animation === 'typing' ? 0.1 : 0.3,
              ease: 'easeInOut',
            }}
          >
            {item}
            {(type === 'words' || type === 'lines') && i !== items.length - 1 ? ' ' : ''}
            {animation === 'highlight' && (
              <motion.span
                className="absolute bottom-0 left-0 right-0 h-[30%] bg-primary/20 -z-10"
                initial={{ width: 0 }}
                animate={inView ? { width: '100%' } : { width: 0 }}
                transition={{ delay: delay + i * duration + 0.3, duration: 0.2 }}
              />
            )}
          </motion.span>
        ))}
      </motion.div>
    );
  };

  // Create array of text items based on type (words, chars, lines)
  const createTextItems = (text: string, type: 'words' | 'chars' | 'lines') => {
    switch (type) {
      case 'words':
        return text.split(' ');
      case 'chars':
        return text.split('');
      case 'lines':
        return text.split(/\\n/);
      default:
        return [text];
    }
  };

  // Define animation variants
  const getAnimationVariants = (animation: string): Variants => {
    switch (animation) {
      case 'slide-up':
        return {
          hidden: { y: 20, opacity: 0 },
          visible: { y: 0, opacity: 1 },
        };
      case 'slide-down':
        return {
          hidden: { y: -20, opacity: 0 },
          visible: { y: 0, opacity: 1 },
        };
      case 'wave':
        return {
          hidden: { rotate: 0, opacity: 0 },
          visible: (i) => ({
            rotate: [0, -5, 5, -5, 0][i % 5],
            opacity: 1,
          }),
        };
      case 'typing':
        return {
          hidden: { opacity: 0, width: '0%' },
          visible: { opacity: 1, width: 'auto' },
        };
      case 'bounce':
        return {
          hidden: { y: 0, opacity: 0 },
          visible: { y: [0, -15, 0], opacity: 1 },
        };
      case 'fade':
      default:
        return {
          hidden: { opacity: 0 },
          visible: { opacity: 1 },
        };
    }
  };

  return <>{renderTextElements()}</>;
};