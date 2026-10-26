import React from 'react'
import { motion } from 'framer-motion'
import { Heart, Sparkles, RotateCcw, ChevronLeft, ChevronRight, Compass } from 'lucide-react'
import { APP_CONFIG } from '@/constants/appConfig'
import { useExperienceStore } from '@/store/useExperienceStore'
import { useGalleryStore } from '@/store/useGalleryStore'
import { MusicToggle } from '@/components/2d/gallery/MusicToggle'
import { soundEngine } from '@/utils/soundEffects'

export const GalleryHUD: React.FC = () => {
  const currentPhase = useExperienceStore((state) => state.currentPhase)
  const setPhase = useExperienceStore((state) => state.setPhase)
  const photos = useGalleryStore((state) => state.photos)
  const focusedPhotoIndex = useGalleryStore((state) => state.focusedPhotoIndex)
  const selectNextPhoto = useGalleryStore((state) => state.selectNextPhoto)
  const selectPrevPhoto = useGalleryStore((state) => state.selectPrevPhoto)
  const setSelectedPhoto = useGalleryStore((state) => state.setSelectedPhoto)

  if (currentPhase !== 'GALLERY') return null

  const handleReturnToLogin = () => {
    soundEngine.playClick()
    setSelectedPhoto(null)
    setPhase('LOGIN')
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-20 flex flex-col justify-between p-3 sm:p-6 pb-6">
      {/* Top Header Bar */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-between w-full max-w-7xl mx-auto gap-2"
      >
        {/* Left: Couple Title & Days Badge */}
        <div className="pointer-events-auto flex items-center gap-2">
          <div className="glass-card px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl flex items-center gap-2 border border-pink-200/30 backdrop-blur-xl">
            <Heart className="w-4 h-4 text-pink-400 fill-pink-400 shrink-0" />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white tracking-wide truncate max-w-[130px] sm:max-w-none">
                {APP_CONFIG.coupleName}
              </span>
              <span className="text-[10px] text-pink-200/70">
                {APP_CONFIG.loveStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Music Toggle & Return button */}
        <div className="pointer-events-auto flex items-center gap-2">
          <MusicToggle />

          <button
            onClick={handleReturnToLogin}
            className="glass-card p-2 sm:px-3 sm:py-2 rounded-full sm:rounded-2xl flex items-center gap-1.5 text-xs text-pink-200 hover:text-white border border-pink-200/30 transition-all cursor-pointer backdrop-blur-xl active:scale-95"
            title="Quay lại màn hình chính"
          >
            <RotateCcw className="w-4 h-4 text-pink-300" />
            <span className="hidden sm:inline">Trang đầu</span>
          </button>
        </div>
      </motion.header>

      {/* Bottom Footer Controls & Tutorial */}
      <motion.footer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex flex-col items-center justify-center gap-2.5 w-full max-w-2xl mx-auto"
      >
        {/* Navigation Quick Bar */}
        <div className="pointer-events-auto glass-card px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full flex items-center gap-3 sm:gap-4 border border-pink-200/30 backdrop-blur-xl shadow-xl">
          <button
            onClick={selectPrevPhoto}
            className="p-1 rounded-full hover:bg-pink-500/20 text-pink-200 hover:text-white transition-all cursor-pointer active:scale-90"
            title="Kỷ niệm trước"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-1.5 px-1 sm:px-2">
            <Sparkles className="w-3.5 h-3.5 text-pink-300 shrink-0" />
            <span className="text-xs font-semibold text-pink-100 whitespace-nowrap">
              {focusedPhotoIndex !== null
                ? `Kỷ niệm ${focusedPhotoIndex + 1} / ${photos.length}`
                : `Hải trình ${photos.length} kỷ niệm`}
            </span>
          </div>

          <button
            onClick={selectNextPhoto}
            className="p-1 rounded-full hover:bg-pink-500/20 text-pink-200 hover:text-white transition-all cursor-pointer active:scale-90"
            title="Kỷ niệm kế tiếp"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Interaction Hint */}
        <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-pink-200/70 bg-black/40 px-3 py-1 rounded-full backdrop-blur-md border border-white/10 text-center">
          <Compass className="w-3.5 h-3.5 text-pink-400 shrink-0" />
          <span>Vuốt/kéo để xoay ngân hà • Nhúm/cuộn để zoom • Chạm ảnh để đọc thư</span>
        </div>
      </motion.footer>
    </div>
  )
}
