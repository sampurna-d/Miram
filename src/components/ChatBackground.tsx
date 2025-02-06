"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { interpolate } from "flubber"
import { BITMOJI_THRESHOLD } from "../constants/app"

// Define circle and heart paths with the same bounding box
const circlePath = "M100,30 A70,70 0 1,1 100,170 A70,70 0 1,1 100,30"
const heartPath = "M100,30 C120,10 160,10 180,30 C200,50 200,90 150,130 C120,160 100,180 100,180 C100,180 80,160 50,130 C0,90 0,50 20,30 C40,10 80,10 100,30";

interface ChatBackgroundProps {
  chatCount: number
}

export default function ChatBackground({ chatCount }: ChatBackgroundProps) {
  const progress = Math.min(chatCount / BITMOJI_THRESHOLD, 1)

  const interpolatedPath = useMemo(() => {
    const interpolator = interpolate(circlePath, heartPath, {
      maxSegmentLength: 2,
      single: true,
    })
    return interpolator(progress)
  }, [progress])

  // Calculate gradient colors based on progress
  const startColor = useMemo(() => {
    // Start: Light blue (ADD8E6) to End: Darker rose (FF8BA0)
    const startR = 173; const endR = 255;
    const startG = 216; const endG = 139;
    const startB = 230; const endB = 160;

    const r = Math.round(startR + (endR - startR) * progress);
    const g = Math.round(startG + (endG - startG) * progress);
    const b = Math.round(startB + (endB - startB) * progress);

    return `rgb(${r},${g},${b})`
  }, [progress])

  // Slightly darker version for gradient end
  const endColor = useMemo(() => {
    // Start: Darker blue (87CEEB) to End: Deep rose (FF6B88)
    const startR = 135; const endR = 255;
    const startG = 206; const endG = 107;
    const startB = 235; const endB = 136;

    const r = Math.round(startR + (endR - startR) * progress);
    const g = Math.round(startG + (endG - startG) * progress);
    const b = Math.round(startB + (endB - startB) * progress);

    return `rgb(${r},${g},${b})`
  }, [progress])

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
      <div className="relative w-full h-full flex items-center justify-center">
        <svg viewBox="0 0 200 200" className="w-[300px] h-[300px]" preserveAspectRatio="xMidYMid meet">
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

          <motion.path
            d={interpolatedPath}
            fill="url(#shapeGradient)"
            initial={false}
            transition={{ duration: 0.5 }}
            className="filter drop-shadow-lg"
            filter="url(#softGlow)"
          />
        </svg>
      </div>
    </div>
  )
}

