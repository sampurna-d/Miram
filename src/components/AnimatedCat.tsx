import type React from "react"
import { useState, useEffect } from "react"

interface AnimatedCupidProps {
  onClick: () => void
  isThinking: boolean
}

const AnimatedCupid: React.FC<AnimatedCupidProps> = ({ onClick, isThinking }) => {
  const [isTalking, setIsTalking] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    const messages = ["Looking for love?", "Let's find your match!", "Cupid's here to help!", "Love is in the air!"]
    const interval = setInterval(() => {
      setIsTalking(true)
      setMessage(messages[Math.floor(Math.random() * messages.length)])
      setTimeout(() => setIsTalking(false), 3000)
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative cursor-pointer group" onClick={onClick}>
      <div className="w-[300px] h-[300px] relative">
        <img
          src="/cupid.gif"
          alt="Animated Cupid"
          className="w-full h-full object-contain hover:scale-110 transition-transform duration-300"
        />
      </div>

      {/* Speech bubble */}
      {isTalking && (
        <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-white rounded-2xl p-3 shadow-lg animate-bounce">
          <div className="relative">
            <p className="text-sm font-medium text-pink-600 whitespace-nowrap">{message}</p>
            {/* Speech bubble triangle */}
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-white" />
          </div>
        </div>
      )}

      {/* Thinking animation */}
      {isThinking && (
        <div className="absolute -top-12 right-0 bg-white rounded-full p-2 shadow-md">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
            <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
          </div>
        </div>
      )}

      {/* Hover effect glow */}
      <div className="absolute inset-0 bg-pink-200 rounded-full filter blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
    </div>
  )
}

export default AnimatedCupid

