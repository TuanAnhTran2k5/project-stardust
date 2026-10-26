import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import { useExperienceStore } from '@/store/useExperienceStore'
import { useGalleryStore } from '@/store/useGalleryStore'
import { UnifiedCosmicParticles } from '@/components/3d/galaxy/UnifiedCosmicParticles'
import { ShootingStar } from '@/components/3d/galaxy/ShootingStar'
import { FloatingGallery } from '@/components/3d/gallery/FloatingGallery'
import { CameraController } from '@/components/3d/camera/CameraController'
import { PubgAnimeTransition } from '@/components/3d/transition/PubgAnimeTransition'
import { HeartAvatarMedallion } from '@/components/3d/galaxy/HeartAvatarMedallion'
import { HeartParticleVisual } from '@/components/3d/galaxy/HeartParticleVisual'
import { CosmicShockwave } from '@/components/3d/galaxy/CosmicShockwave'

export const ExperienceCanvas: React.FC = () => {
  const currentPhase = useExperienceStore((state) => state.currentPhase)
  const completeTransition = useExperienceStore((state) => state.completeTransition)
  const selectedPhoto = useGalleryStore((state) => state.selectedPhoto)

  const enableOrbit = currentPhase === 'GALLERY' && selectedPhoto === null

  return (
    <div className="fixed inset-0 z-0 bg-[#060714] touch-none select-none">
      <Canvas
        camera={{ position: [0, 0, 16], fov: 50, near: 0.1, far: 100 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      >
        <Suspense fallback={null}>
          <color attach="background" args={['#060714']} />

          {/* Ánh sáng lãng mạn tông ấm & tím ngân hà */}
          <ambientLight intensity={0.8} color="#ffe4e6" />
          <pointLight position={[0, 8, 8]} intensity={2.2} color="#f472b6" distance={30} />
          <pointLight position={[-8, -5, 5]} intensity={1.8} color="#c084fc" distance={30} />
          <pointLight position={[6, -6, -6]} intensity={1.5} color="#818cf8" distance={30} />

          {/* Camera Controller */}
          <CameraController />

          {/* Phân đoạn chuyển cảnh PUBG Anime bắn đạn trái tim */}
          {currentPhase === 'PUBG_TRANSITION' && <PubgAnimeTransition />}

          {/* Hệ thống vũ trụ & ngân hà */}
          <Stars radius={45} depth={50} count={3500} factor={3} saturation={0.5} fade speed={1} />
          
          {/* Hệ thống hạt thống nhất: Từ nền login kết thành Trái Tim 3D và nổ pháo hoa */}
          <UnifiedCosmicParticles />

          {/* Trái Tim Phát Quang Bằng Hệ Thống Hạt (Chuẩn Mẫu Drone Show Thập Toàn) */}
          {currentPhase === 'HEART_FIREWORKS' && (
            <HeartParticleVisual onComplete={completeTransition} />
          )}

          {/* Huy hiệu ảnh chân dung tròn phát sáng của Nữ ở tâm Trái Tim 3D */}
          {currentPhase === 'HEART_FIREWORKS' && <HeartAvatarMedallion />}

          {/* Sóng xung kích ngân hà bung nở khi pháo hoa phát nổ */}
          {currentPhase === 'HEART_FIREWORKS' && <CosmicShockwave />}

          {/* Sao băng lướt qua dải ngân hà */}
          <ShootingStar />

          {/* Album ảnh 3D lơ lửng */}
          {currentPhase === 'GALLERY' && <FloatingGallery />}

          {/* Điều khiển xoay và zoom mượt mà cho cả chuột và cảm ứng đa điểm trên mobile */}
          <OrbitControls
            makeDefault
            enabled={enableOrbit}
            enablePan={false}
            enableZoom={true}
            enableRotate={true}
            minDistance={3.5}
            maxDistance={35}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI * 0.85}
            rotateSpeed={0.9}
            zoomSpeed={1.0}
            enableDamping={true}
            dampingFactor={0.06}
            touches={{
              ONE: 1, // TOUCH_ROTATE (1 ngón vuốt xoay 360 độ)
              TWO: 2, // TOUCH_DOLLY_PAN (2 ngón nhúm để zoom in/out)
            }}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}
