import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Volume2, Volume1, VolumeX } from 'lucide-react'
import { useSoundSystem } from '@/hooks/useSoundSystem'
import { soundEngine } from '@/utils/soundEffects'

interface SoundToggleProps {
  /** Vị trí tùy biến (mặc định: fixed top-4 right-4 z-50) */
  className?: string
  /** Hiển thị nhãn text */
  showLabel?: boolean
}

/**
 * Component Floating Action Button điều khiển Âm thanh kèm Thanh trượt âm lượng (Volume Slider)
 * - Tự động trượt mở thanh Volume khi rê chuột (Desktop) hoặc chạm mở (Mobile)
 * - Click icon loa: Mute / Unmute tức thì
 * - Kéo thanh trượt: Tăng giảm âm lượng mượt mà (0% - 100%)
 */
export const SoundToggle: React.FC<SoundToggleProps> = ({
  className = 'fixed top-4 right-4 z-50',
  showLabel = false,
}) => {
  const { isMuted, isBgmPlaying, bgmVolume, toggleMute, setBgmVolume } = useSoundSystem()
  const [isHovered, setIsHovered] = useState(false)
  const [isSliderActive, setIsSliderActive] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Hiển thị thanh trượt khi đang hover hoặc đang kéo slider
  const showSlider = isHovered || isSliderActive

  // Đóng slider khi click ra ngoài trên màn hình cảm ứng
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

  const handleSpeakerClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    soundEngine.playClick()
    toggleMute()
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value)
    setBgmVolume(val)
  }

  // Âm lượng hiển thị dạng phần trăm (nếu đang Mute thì là 0%)
  const displayVolume = isMuted ? 0 : Math.round(bgmVolume * 100)

  // Chọn icon phù hợp theo mức âm lượng
  const renderVolumeIcon = () => {
    if (isMuted || bgmVolume === 0) {
      return <VolumeX className="w-4 h-4 text-pink-400 group-hover:text-pink-300 transition-colors" />
    }
    if (bgmVolume < 0.4) {
      return <Volume1 className="w-4 h-4 text-pink-300 group-hover:text-white transition-colors" />
    }
    return <Volume2 className="w-4 h-4 text-pink-300 group-hover:text-white transition-colors" />
  }

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        if (!isSliderActive) setIsHovered(false)
      }}
      className={`${className} pointer-events-auto flex items-center select-none`}
    >
      <motion.div
        layout
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="glass-card px-2.5 py-2 sm:px-3 sm:py-2.5 rounded-full flex items-center gap-2 border border-pink-300/40 text-pink-200 hover:border-pink-300/80 transition-all shadow-xl backdrop-blur-2xl bg-black/40 group"
      >
        {/* Nút bật/tắt âm thanh nhanh (Icon loa) */}
        <button
          onClick={handleSpeakerClick}
          className="flex items-center justify-center p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer active:scale-95"
          title={isMuted ? 'Bật âm thanh (Unmute)' : 'Tắt âm thanh (Mute)'}
          aria-label="Bật/Tắt âm thanh"
        >
          {renderVolumeIcon()}
        </button>

        {/* Hiệu ứng sóng nhạc nhảy theo điệu beat */}
        <div
          onClick={() => setIsSliderActive(!isSliderActive)}
          className="flex items-end gap-[2px] h-3.5 w-3.5 cursor-pointer"
          title="Bấm để mở thanh chỉnh âm lượng"
        >
          {[45, 95, 65, 100].map((heightPct, idx) => (
            <span
              key={idx}
              className={`w-[2px] bg-gradient-to-t from-pink-400 to-rose-200 rounded-full transition-all duration-300 ${
                isMuted || !isBgmPlaying ? 'h-[3px] opacity-35' : 'animate-bounce'
              }`}
              style={{
                height: isMuted || !isBgmPlaying ? '3px' : `${heightPct}%`,
                animationDelay: `${idx * 0.14}s`,
                animationDuration: '0.75s',
              }}
            />
          ))}
        </div>

        {/* Thanh trượt âm lượng (Volume Slider) mở ra mượt mà */}
        <AnimatePresence>
          {showSlider && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 'auto', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="flex items-center gap-2 overflow-hidden pl-1 pr-1"
            >
              {/* Range Input tùy biến */}
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
                  className="w-full h-1.5 bg-pink-950/60 rounded-lg appearance-none cursor-pointer accent-pink-400 focus:outline-none focus:ring-1 focus:ring-pink-300/50"
                  style={{
                    background: `linear-gradient(to right, #f472b6 0%, #fb7185 ${displayVolume}%, rgba(80, 20, 50, 0.4) ${displayVolume}%, rgba(80, 20, 50, 0.4) 100%)`,
                  }}
                  title={`Âm lượng: ${displayVolume}%`}
                  aria-label="Thanh trượt âm lượng"
                />
              </div>

              {/* Phần trăm âm lượng hiển thị số */}
              <span className="text-[11px] font-mono font-medium text-pink-200/90 w-7 text-right">
                {displayVolume}%
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Nhãn tùy chọn nếu được kích hoạt */}
        {showLabel && !showSlider && (
          <span className="text-xs font-medium tracking-wide pr-1">
            {isMuted ? 'Tắt' : 'Nhạc'}
          </span>
        )}

        {/* Đốm sáng huyền ảo khi đang phát nhạc */}
        {!isMuted && isBgmPlaying && (
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-400 rounded-full animate-ping opacity-75 pointer-events-none" />
        )}
      </motion.div>
    </div>
  )
}
