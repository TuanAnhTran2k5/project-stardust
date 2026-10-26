import React, { useMemo } from 'react'

interface HeartItem {
  id: number
  left: number
  size: number
  duration: number
  delay: number
  color: string
}

const PASTEL_COLORS = [
  'rgba(255, 182, 193, 0.6)', // Light pink
  'rgba(255, 192, 203, 0.5)', // Pink
  'rgba(230, 230, 250, 0.6)', // Lavender
  'rgba(255, 218, 185, 0.5)', // Peach
  'rgba(255, 240, 245, 0.7)', // Lavender blush
]

export const FloatingHearts: React.FC = () => {
  const hearts: HeartItem[] = useMemo(() => {
    return Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      left: Math.random() * 96 + 2,
      size: Math.random() * 20 + 14,
      duration: Math.random() * 7 + 8,
      delay: Math.random() * 6,
      color: PASTEL_COLORS[Math.floor(Math.random() * PASTEL_COLORS.length)],
    }))
  }, [])

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-10">
      {hearts.map((h) => (
        <span
          key={h.id}
          className="absolute bottom-0 opacity-0 will-change-transform"
          style={{
            left: `${h.left}%`,
            fontSize: `${h.size}px`,
            color: h.color,
            animation: `floatUp ${h.duration}s infinite ease-in-out`,
            animationDelay: `${h.delay}s`,
            textShadow: `0 0 10px ${h.color}`,
          }}
        >
          ❤
        </span>
      ))}
    </div>
  )
}
