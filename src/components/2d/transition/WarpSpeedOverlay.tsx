import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useExperienceStore } from '@/store/useExperienceStore'
import { Sparkles, Heart } from 'lucide-react'

export const WarpSpeedOverlay: React.FC = () => {
  const currentPhase = useExperienceStore((state) => state.currentPhase)
  const [stage, setStage] = useState<'gathering' | 'heart' | 'fireworks'>('gathering')

  useEffect(() => {
    if (currentPhase === 'HEART_FIREWORKS') {
      setStage('gathering')

      // Sau 1.2s: Trái tim nở bung hoàn chỉnh và đập nhịp theo tiếng tim
      const t1 = setTimeout(() => {
        setStage('heart')
      }, 1200)

      // Sau 6.5s: Pháo hoa bắt đầu bung nổ
      const t2 = setTimeout(() => {
        setStage('fireworks')
      }, 6500)

      return () => {
        clearTimeout(t1)
        clearTimeout(t2)
      }
    }
  }, [currentPhase])

  const isTransitioning = currentPhase === 'HEART_FIREWORKS' || currentPhase === 'PUBG_TRANSITION'

  return (
    <AnimatePresence>
      {isTransitioning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="fixed inset-0 z-20 pointer-events-none flex flex-col items-center justify-between p-4 sm:p-8"
        >
          {/* Top spacer */}
          <div />

          {/* Top: Banner chuyển cảnh PUBG Anime */}
          {currentPhase === 'PUBG_TRANSITION' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ duration: 0.6 }}
              className="pointer-events-auto glass-card-pastel px-5 py-2.5 rounded-full border border-pink-400/30 shadow-2xl backdrop-blur-xl text-center max-w-sm sm:max-w-md mx-auto mt-2"
            >
              <div className="flex items-center justify-center gap-2">
                <Heart className="w-4 h-4 fill-pink-500 text-pink-400 animate-pulse shrink-0" />
                <span className="text-xs sm:text-sm font-semibold bg-gradient-to-r from-pink-200 via-rose-300 to-purple-200 bg-clip-text text-transparent">
                  AWM Love Bullet • Một phát bắn găm trọn tim anh 💘
                </span>
              </div>
            </motion.div>
          ) : (
            <div />
          )}

          {/* Bottom Floating Status Banner (Chỉ hiển thị trong giai đoạn Trái Tim & Pháo Hoa) */}
          {currentPhase === 'HEART_FIREWORKS' && (
            <motion.div
              key={stage}
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              transition={{ duration: 0.5 }}
              className="pointer-events-auto glass-card-pastel px-5 py-3 rounded-2xl border border-pink-300/40 shadow-2xl backdrop-blur-xl text-center max-w-sm sm:max-w-md w-full mx-auto"
            >
              {stage === 'gathering' && (
                <div className="flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4 text-pink-300 animate-spin shrink-0" />
                  <span className="text-xs sm:text-sm font-semibold text-pink-100">
                    Các hạt sao đang hội tụ kết thành Trái Tim...
                  </span>
                </div>
              )}

              {stage === 'heart' && (
                <div className="flex flex-col items-center justify-center gap-1">
                  <div className="flex items-center gap-1.5 text-xs text-rose-300 font-bold">
                    <Heart className="w-4 h-4 fill-pink-500 text-pink-400 animate-ping" />
                    <span>Trái Tim Tinh Tú Thắp Sáng</span>
                  </div>
                  <p className="text-sm sm:text-base font-bold bg-gradient-to-r from-pink-100 via-rose-200 to-purple-200 bg-clip-text text-transparent">
                    Kho báu vĩ đại nhất của anh chính là Em 💖
                  </p>
                </div>
              )}

              {stage === 'fireworks' && (
                <div className="flex flex-col items-center justify-center gap-1">
                  <div className="flex items-center gap-1.5 text-xs text-amber-300 font-bold">
                    <Sparkles className="w-4 h-4 text-amber-300 animate-bounce" />
                    <span>Đại Pháo Hoa Ngân Hà</span>
                  </div>
                  <p className="text-sm sm:text-base font-bold bg-gradient-to-r from-amber-100 via-pink-200 to-rose-300 bg-clip-text text-transparent">
                    Nguyện ước bên nhau mãi mãi ✨
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
