import type React from "react"
import { useState, useEffect } from "react"

interface DynamicBackgroundProps {
  totalMessages: number
}

const DynamicBackground: React.FC<DynamicBackgroundProps> = ({ totalMessages }) => {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    setProgress(Math.min(totalMessages / 50, 1))
  }, [totalMessages])

  const circleToHeartPath = (t: number) => {
    const circle = `M50,50 m-45,0 a45,45 0 1,0 90,0 a45,45 0 1,0 -90,0`
    const heart = `M50,30 C30,10 0,30 0,60 C0,90 30,100 50,90 C70,100 100,90 100,60 C100,30 70,10 50,30`
    return `${circle} ${t > 0 ? "L" : "M"} ${heart}`
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="w-full h-full opacity-10">
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d1d5db" />
            <stop offset={`${progress * 100}%`} stopColor="#ef4444" />
          </linearGradient>
        </defs>
        <path
          d={circleToHeartPath(progress)}
          fill="url(#gradient)"
          stroke="none"
          style={{
            transition: "all 0.5s ease-in-out",
          }}
        />
      </svg>
    </div>
  )
}

export default DynamicBackground

