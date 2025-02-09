"use client"

import React, { useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { interpolate } from "flubber"
import { BITMOJI_THRESHOLD } from "../constants/app"

/**
 * SVG path definitions for shape morphing
 * Both paths are normalized to the same 200x200 viewBox for consistent sizing
 */
const SVG_PATHS = {
  // Circle path centered at (100,100) with radius 70
  CIRCLE: "M100,30 A70,70 0 1,1 100,170 A70,70 0 1,1 100,30",
  // Heart path with same bounding box as circle
  HEART: "M100,30 C120,10 160,10 180,30 C200,50 200,90 150,130 C120,160 100,180 100,180 C100,180 80,160 50,130 C0,90 0,50 20,30 C40,10 80,10 100,30"
} as const

/**
 * Color configuration for gradient transitions
 */
const COLORS = {
  START: {
    LIGHT: { R: 173, G: 216, B: 230 }, // Light blue (ADD8E6)
    DARK: { R: 255, G: 139, B: 160 }   // Darker rose (FF8BA0)
  },
  END: {
    LIGHT: { R: 135, G: 206, B: 235 }, // Darker blue (87CEEB)
    DARK: { R: 255, G: 107, B: 136 }   // Deep rose (FF6B88)
  }
} as const

interface ChatBackgroundProps {
  /** Number of messages in the chat. Used to calculate morphing progress */
  chatCount: number
}

/**
 * ChatBackground Component
 * 
 * Renders a dynamic background shape that morphs from a circle to a heart based on chat message count.
 * Uses Flubber for smooth shape interpolation and includes a gradient effect that transitions with the shape.
 * 
 * @param props - Component props
 * @param props.chatCount - Number of messages to base the morphing progress on
 * 
 * @example
 * ```tsx
 * <ChatBackground chatCount={5} />
 * ```
 */
export default function ChatBackground({ chatCount }: ChatBackgroundProps): JSX.Element {
  // Calculate progress based on message count, capped at 1
  const progress = Math.min(chatCount / BITMOJI_THRESHOLD, 1)

  /**
   * Generate interpolated path between circle and heart shapes
   * Uses Flubber's interpolate function for smooth transitions
   */
  const interpolatedPath = useMemo(() => {
    try {
      const interpolator = interpolate(SVG_PATHS.CIRCLE, SVG_PATHS.HEART, {
        maxSegmentLength: 2, // Lower value for smoother interpolation
        single: true, // Ensure single path output
      })
      return interpolator(progress)
    } catch (error) {
      console.error('Error interpolating path:', error)
      return SVG_PATHS.CIRCLE // Fallback to circle on error
    }
  }, [progress])

  /**
   * Calculate gradient colors based on progress
   */
  const { startColor, endColor } = useMemo(() => {
    const calculateColor = (start: { R: number; G: number; B: number }, end: { R: number; G: number; B: number }) => {
      const r = Math.round(start.R + (end.R - start.R) * progress);
      const g = Math.round(start.G + (end.G - start.G) * progress);
      const b = Math.round(start.B + (end.B - start.B) * progress);
      return `rgb(${r},${g},${b})`;
    };

    return {
      startColor: calculateColor(COLORS.START.LIGHT, COLORS.START.DARK),
      endColor: calculateColor(COLORS.END.LIGHT, COLORS.END.DARK)
    };
  }, [progress]);

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
      <div className="relative w-full h-full flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.svg 
            key="background-shape"
            viewBox="0 0 200 200" 
            className="w-[300px] h-[300px]" 
            preserveAspectRatio="xMidYMid meet"
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Define gradients and filters */}
            <defs>
              <linearGradient id="shapeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={startColor} stopOpacity="0.3" />
                <stop offset="100%" stopColor={endColor} stopOpacity="0.2" />
              </linearGradient>
              <filter id="softGlow">
                <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
                <feColorMatrix
                  type="matrix"
                  values="1 0 0 0 0
                          0 1 0 0 0
                          0 0 1 0 0
                          0 0 0 15 -7"
                />
              </filter>
            </defs>

            {/* Animated shape with gradient and glow effects */}
            <motion.path
              d={interpolatedPath}
              fill="url(#shapeGradient)"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                duration: 0.5, 
                ease: "easeInOut",
                opacity: { duration: 0.3 }
              }}
              className="filter drop-shadow-lg"
              filter="url(#softGlow)"
            />
          </motion.svg>
        </AnimatePresence>
      </div>
    </div>
  )
}

