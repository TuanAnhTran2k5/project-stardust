import React, { useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useExperienceStore } from '@/store/useExperienceStore'
import { ExperienceCanvas } from '@/components/3d/canvas/ExperienceCanvas'
import { LoginCard } from '@/components/2d/login/LoginCard'
import { FloatingHearts } from '@/components/2d/login/FloatingHearts'
import { WarpSpeedOverlay } from '@/components/2d/transition/WarpSpeedOverlay'
import { GalleryHUD } from '@/components/2d/gallery/GalleryHUD'
import { PhotoDetailModal } from '@/components/2d/gallery/PhotoDetailModal'
import { SoundToggle } from '@/components/2d/common/SoundToggle'
import { preloadCharacterAssets } from '@/constants/characterAssets'

export const App: React.FC = () => {
  const currentPhase = useExperienceStore((state) => state.currentPhase)

  useEffect(() => {
    preloadCharacterAssets()
  }, [])

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#060714] text-white">
      {/* 3D WebGL Canvas Layer (Background & Galaxy Experience) */}
      <ExperienceCanvas />

      {/* 2D DOM Layer (UI, Overlays & Transitions) */}
      <div className="relative z-10 w-full h-full pointer-events-none">
        <AnimatePresence mode="wait">
          {currentPhase === 'LOGIN' && (
            <div
              key="login-screen"
              className="absolute inset-0 flex items-center justify-center pointer-events-auto"
            >
              <FloatingHearts />
              <LoginCard />
            </div>
          )}
        </AnimatePresence>

        {/* Warp speed hyperspace effect */}
        <WarpSpeedOverlay />

        {/* 3D Gallery HUD and interactions */}
        {currentPhase === 'GALLERY' && <GalleryHUD />}
      </div>

      {/* Nút điều khiển âm thanh toàn cục (Floating Action Button) */}
      {currentPhase !== 'GALLERY' && <SoundToggle />}

      {/* Modal chi tiết ảnh (Tầng trên cùng độc lập, bắt trọn 100% click) */}
      <PhotoDetailModal />
    </main>
  )
}

export default App
