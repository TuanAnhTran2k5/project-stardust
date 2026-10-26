import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, Calendar, Heart, Sparkles } from 'lucide-react'
import { useGalleryStore } from '@/store/useGalleryStore'
import confetti from 'canvas-confetti'

export const PhotoDetailModal: React.FC = () => {
  const selectedPhoto = useGalleryStore((state) => state.selectedPhoto)
  const setSelectedPhoto = useGalleryStore((state) => state.setSelectedPhoto)
  const selectNextPhoto = useGalleryStore((state) => state.selectNextPhoto)
  const selectPrevPhoto = useGalleryStore((state) => state.selectPrevPhoto)

  useEffect(() => {
    if (selectedPhoto) {
      // Bắn confetti hình trái tim khi mở kỷ niệm
      confetti({
        particleCount: 35,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ff9ebb', '#e0aaff', '#ffd1dc', '#fff'],
      })

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setSelectedPhoto(null)
        } else if (e.key === 'ArrowRight') {
          selectNextPhoto()
        } else if (e.key === 'ArrowLeft') {
          selectPrevPhoto()
        }
      }

      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedPhoto, setSelectedPhoto, selectNextPhoto, selectPrevPhoto])

  if (!selectedPhoto) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-auto">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => {
            e.stopPropagation()
            setSelectedPhoto(null)
          }}
          className="absolute inset-0 bg-black/80 backdrop-blur-md cursor-pointer pointer-events-auto"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="relative z-10 w-full max-w-3xl glass-card rounded-3xl overflow-hidden border border-pink-200/30 shadow-2xl bg-[#0e0c1f]/90 max-h-[90vh] flex flex-col md:flex-row pointer-events-auto"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setSelectedPhoto(null)
            }}
            className="absolute top-4 right-4 z-30 w-10 h-10 rounded-full bg-black/60 hover:bg-pink-500/40 border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95"
            title="Đóng modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Left/Top: Image Display (Tự động thích ứng cả ảnh dọc lẫn ảnh ngang - 100% trọn vẹn, không cắt mặt) */}
          <div className="relative md:w-1/2 min-h-[240px] max-h-[45vh] sm:max-h-[50vh] md:max-h-none md:min-h-[380px] bg-black/60 overflow-hidden flex items-center justify-center shrink-0">
            {/* Lớp nền mờ Ambient Backdrop tự động hòa trộn sắc thái màu ảnh */}
            <img
              src={selectedPhoto.imageUrl}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover filter blur-2xl opacity-45 scale-125 pointer-events-none"
            />

            {/* Ảnh chính hiển thị nguyên vẹn 100% (object-contain) - Không bao giờ bị cắt mất phần đầu/mặt */}
            <img
              src={selectedPhoto.imageUrl}
              alt={selectedPhoto.title}
              className="relative z-10 max-w-full max-h-full w-auto h-auto object-contain drop-shadow-2xl transition-transform duration-500 hover:scale-[1.02] p-1.5 sm:p-2"
            />
          </div>

          {/* Right/Bottom: Story & Details */}
          <div className="md:w-1/2 p-4 sm:p-7 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center gap-2 text-xs text-pink-300 font-semibold mb-2">
                <Calendar className="w-3.5 h-3.5" />
                <span>{selectedPhoto.date}</span>
                <span className="text-pink-400/40">•</span>
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  Kỷ niệm đáng nhớ
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 font-heading">
                {selectedPhoto.title}
              </h2>

              <p className="text-xs text-pink-200/80 italic mb-4 font-romantic text-base sm:text-lg">
                "{selectedPhoto.caption}"
              </p>

              <div className="border-t border-white/10 pt-4">
                <p className="text-xs sm:text-sm text-gray-200 leading-relaxed font-sans font-normal whitespace-pre-line">
                  {selectedPhoto.story}
                </p>
              </div>
            </div>

            {/* Bottom Controls (Prev / Next) */}
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  selectPrevPhoto()
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-pink-500/20 text-xs text-pink-200 border border-white/10 transition-all cursor-pointer active:scale-95"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Kỷ niệm trước</span>
              </button>

              <div className="flex items-center gap-1 text-pink-400">
                <Heart className="w-4 h-4 fill-pink-500" />
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  selectNextPhoto()
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-pink-500/20 text-xs text-pink-200 border border-white/10 transition-all cursor-pointer active:scale-95"
              >
                <span>Kỷ niệm kế</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
