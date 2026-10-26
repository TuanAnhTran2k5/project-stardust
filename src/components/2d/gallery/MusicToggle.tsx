import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Volume2, Volume1, VolumeX } from 'lucide-react'
import { useSoundSystem } from '@/hooks/useSoundSystem'
import { soundEngine } from '@/utils/soundEffects'

export const MusicToggle: React.FC = () => {
  const { isMuted, isBgmPlaying, bgmVolume, toggleMute, setBgmVolume } = useSoundSystem()
  const [isHovered, setIsHovered] = useState(false)
  const [isSliderActive, setIsSliderActive] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const showSlider = isHovered || isSliderActive

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsSliderActive(false)
        setIsHovered(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [])

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    soundEngine.playClick()
    toggleMute()
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value)
    setBgmVolume(val)
  }

  const displayVolume = isMuted ? 0 : Math.round(bgmVolume * 100)

  const renderVolumeIcon = () => {
    if (isMuted || bgmVolume === 0) {
      return <VolumeX className="w-4 h-4 text-pink-400" />
    }
    if (bgmVolume < 0.4) {
      return <Volume1 className="w-4 h-4 text-pink-300" />
    }
    return <Volume2 className="w-4 h-4 text-pink-300 animate-pulse" />
  }

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        if (!isSliderActive) setIsHovered(false)
      }}
      className="relative flex items-center select-none"
    >
      <motion.div
        layout
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="glass-card px-3 py-2 rounded-full flex items-center gap-2 border border-pink-200/30 text-pink-200 hover:text-white transition-all shadow-lg backdrop-blur-xl bg-black/30"
      >
        <button
          onClick={handleToggle}
          className="flex items-center justify-center p-0.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer active:scale-95"
          title={isMuted ? 'Bật âm thanh (Unmute)' : 'Tắt âm thanh (Mute)'}
        >
          {renderVolumeIcon()}
        </button>

        {/* Animated Sound Wave Bars */}
        <div
          onClick={() => setIsSliderActive(!isSliderActive)}
          className="flex items-end gap-[3px] h-3.5 w-4 cursor-pointer"
          title="Bấm để chỉnh âm lượng"
        >
          {[40, 90, 60, 100].map((h, i) => (
            <span
              key={i}
              className={`w-[2px] bg-pink-300 rounded-full transition-all duration-300 ${
                isMuted || !isBgmPlaying ? 'h-1 opacity-40' : 'animate-bounce'
              }`}
              style={{
                height: isMuted || !isBgmPlaying ? '3px' : `${h}%`,
                animationDelay: `${i * 0.15}s`,
                animationDuration: '0.8s',
              }}
            />
          ))}
        </div>

        {/* Thanh trượt âm lượng trượt ra mượt mà */}
        <AnimatePresence>
          {showSlider && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 'auto', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="flex items-center gap-2 overflow-hidden pl-1 pr-1"
            >
              <div className="relative flex items-center w-20 sm:w-24">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : bgmVolume}
                  onChange={handleVolumeChange}
                  onFocus={() => setIsSliderActive(true)}
                  onBlur={() => setIsSliderActive(false)}
                  className="w-full h-1.5 bg-pink-950/60 rounded-lg appearance-none cursor-pointer accent-pink-400 focus:outline-none"
                  style={{
                    background: `linear-gradient(to right, #f472b6 0%, #fb7185 ${displayVolume}%, rgba(80, 20, 50, 0.4) ${displayVolume}%, rgba(80, 20, 50, 0.4) 100%)`,
                  }}
                  title={`Âm lượng: ${displayVolume}%`}
                />
              </div>

              <span className="text-[11px] font-mono text-pink-200/90 w-7 text-right">
                {displayVolume}%
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {!showSlider && (
          <span className="text-xs font-medium hidden sm:inline">
            {isMuted ? 'Muted' : 'Nhạc nền'}
          </span>
        )}
      </motion.div>
    </div>
  )
}
