import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedBackgroundPatternProps {
  className?: string;
  variant?: "dots" | "grid" | "waves" | "circles";
  color?: string;
  density?: "low" | "medium" | "high";
  speed?: "slow" | "medium" | "fast";
  direction?: "top" | "right" | "bottom" | "left" | "random";
  scale?: number;
  opacity?: number;
  responsive?: boolean;
}

export const AnimatedBackgroundPattern: React.FC<AnimatedBackgroundPatternProps> = ({
  className,
  variant = "dots",
  color = "currentColor",
  density = "medium",
  speed = "medium",
  direction = "random",
  scale = 1,
  opacity = 0.1,
  responsive = true,
}) => {
  // Speed mapping
  const getAnimationDuration = () => {
    switch (speed) {
      case "slow": return 30;
      case "fast": return 10;
      case "medium":
      default: return 20;
    }
  };

  // Pattern density mapping
  const getDensityValue = () => {
    switch (density) {
      case "low": return 30;
      case "high": return 10;
      case "medium":
      default: return 20;
    }
  };

  // Animation direction
  const getDirection = () => {
    if (direction === "random") {
      const directions = ["top", "right", "bottom", "left"];
      return directions[Math.floor(Math.random() * directions.length)];
    }
    return direction;
  };

  // Animation properties based on direction
  const getAnimation = () => {
    const dir = getDirection();
    switch (dir) {
      case "top":
        return {
          y: [0, -getDensityValue()],
          x: 0,
        };
      case "right":
        return {
          x: [0, getDensityValue()],
          y: 0,
        };
      case "bottom":
        return {
          y: [0, getDensityValue()],
          x: 0,
        };
      case "left":
        return {
          x: [0, -getDensityValue()],
          y: 0,
        };
      default:
        return {
          y: [0, -getDensityValue()],
          x: 0,
        };
    }
  };

  // Render appropriate pattern
  const renderPattern = () => {
    const densityValue = getDensityValue();
    const animationProps = getAnimation();
    const duration = getAnimationDuration();

    switch (variant) {
      case "grid":
        return (
          <motion.div
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: `linear-gradient(${color} 1px, transparent 1px), linear-gradient(to right, ${color} 1px, transparent 1px)`,
              backgroundSize: `${densityValue}px ${densityValue}px`,
              opacity,
            }}
            animate={animationProps}
            transition={{
              repeat: Infinity,
              duration,
              ease: "linear",
            }}
          />
        );
      
      case "waves":
        return (
          <svg width="100%" height="100%" className="absolute inset-0 z-0" style={{ opacity }}>
            <defs>
              <pattern id="waves" x="0" y="0" width={densityValue * 2} height={densityValue} patternUnits="userSpaceOnUse">
                <motion.path
                  d={`M 0 ${densityValue/2} Q ${densityValue/2} 0, ${densityValue} ${densityValue/2} T ${densityValue*2} ${densityValue/2}`}
                  fill="none"
                  stroke={color}
                  strokeWidth="1"
                  animate={{
                    d: [
                      `M 0 ${densityValue/2} Q ${densityValue/2} 0, ${densityValue} ${densityValue/2} T ${densityValue*2} ${densityValue/2}`,
                      `M 0 ${densityValue/2} Q ${densityValue/2} ${densityValue}, ${densityValue} ${densityValue/2} T ${densityValue*2} ${densityValue/2}`,
                      `M 0 ${densityValue/2} Q ${densityValue/2} 0, ${densityValue} ${densityValue/2} T ${densityValue*2} ${densityValue/2}`,
                    ]
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: duration / 2,
                    ease: "easeInOut",
                  }}
                />
              </pattern>
            </defs>
            <rect x="0" y="0" width="100%" height="100%" fill="url(#waves)" />
          </svg>
        );
      
      case "circles":
        return (
          <svg width="100%" height="100%" className="absolute inset-0 z-0" style={{ opacity }}>
            <defs>
              <pattern id="circles" x="0" y="0" width={densityValue} height={densityValue} patternUnits="userSpaceOnUse">
                <motion.circle
                  cx={densityValue / 2}
                  cy={densityValue / 2}
                  r={densityValue / 6}
                  fill={color}
                  animate={{
                    r: [densityValue / 6, densityValue / 4, densityValue / 6]
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: duration / 3,
                    ease: "easeInOut",
                  }}
                />
              </pattern>
            </defs>
            <rect x="0" y="0" width="100%" height="100%" fill="url(#circles)" />
          </svg>
        );
      
      case "dots":
      default:
        return (
          <motion.div
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: `radial-gradient(${color} 1px, transparent 1px)`,
              backgroundSize: `${densityValue}px ${densityValue}px`,
              opacity,
            }}
            animate={animationProps}
            transition={{
              repeat: Infinity,
              duration,
              ease: "linear",
            }}
          />
        );
    }
  };

  return (
    <div
      className={cn(
        "absolute inset-0 overflow-hidden",
        responsive && "opacity-0 sm:opacity-100",
        className
      )}
      style={{ transform: `scale(${scale})` }}
    >
      {renderPattern()}
    </div>
  );
};