import React, { useRef, useState, useMemo } from 'react'
import { Float, Image, Text, RoundedBox } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { IPhotoItem } from '@/types/gallery'
import { useGalleryStore } from '@/store/useGalleryStore'
import { soundEngine } from '@/utils/soundEffects'

interface PhotoFrame3DProps {
  photo: IPhotoItem
  index: number
  position: [number, number, number]
  rotation?: [number, number, number]
}

/**
 * Component Khung Ảnh 3D Tình Yêu (Cinematic PhotoFrame3D)
 * - Genesis Spawn: Bắn vút từ tâm vụ nổ pháo hoa dạt ra vị trí xoắn ốc
 * - Halo Glow: Hào quang phát sáng mềm mại bao quanh viền ảnh
 * - Micro Orbit Sparkles: Vòng bụi sao lấp lánh nhẹ nhàng quanh khung ảnh
 */
export const PhotoFrame3D: React.FC<PhotoFrame3DProps> = ({
  photo,
  index,
  position,
  rotation = [0, 0, 0],
}) => {
  const [hovered, setHovered] = useState(false)
  const groupRef = useRef<THREE.Group>(null!)
  const innerRef = useRef<THREE.Group>(null!)
  const haloRef = useRef<THREE.Mesh>(null!)

  const setSelectedPhoto = useGalleryStore((state) => state.setSelectedPhoto)
  const selectedPhoto = useGalleryStore((state) => state.selectedPhoto)
  const isSelected = selectedPhoto?.id === photo.id

  // Bộ đếm thời gian cho hoạt cảnh xuất hiện Genesis
  const genesisTime = useRef(0)
  const hasPlayedSpawnSound = useRef(false)

  // 6 hạt bụi sao vi mô xoay quanh khung ảnh tạo cảm giác bồng bềnh thần tiên
  const sparkles = useMemo(() => {
    return Array.from({ length: 6 }).map((_, i) => ({
      angle: (i / 6) * Math.PI * 2,
      speed: 1.2 + (i % 3) * 0.4,
      radiusX: 1.5 + (i % 2) * 0.2,
      radiusY: 1.9 + (i % 2) * 0.2,
      size: 0.045 + (i % 3) * 0.02,
    }))
  }, [])

  const handlePointerOver = (e: { stopPropagation: () => void }) => {
    e.stopPropagation()
    setHovered(true)
    document.body.style.cursor = 'pointer'
    soundEngine.playSparkle()
  }

  const handlePointerOut = () => {
    setHovered(false)
    document.body.style.cursor = 'auto'
  }

  const handleClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation()
    setSelectedPhoto(photo)
  }

  useFrame((_, delta) => {
    if (!groupRef.current) return

    genesisTime.current += delta
    const t = genesisTime.current

    // -------------------------------------------------------------------------
    // GENESIS SPAWN ANIMATION:
    // Bay vút từ tâm (0,0,0) dạt ra vị trí xoắn ốc theo thứ tự so le (staggered)
    // -------------------------------------------------------------------------
    const spawnDelay = index * 0.12 // Mỗi khung ảnh xuất hiện cách nhau 0.12s
    if (t < spawnDelay) {
      groupRef.current.position.set(0, 0, 0)
      groupRef.current.scale.set(0, 0, 0)
      return
    }

    const progress = Math.min((t - spawnDelay) / 0.9, 1.0)
    // Elastic/Back Ease-Out để có độ nảy bung nở nhẹ tự nhiên
    const c1 = 1.4
    const c3 = c1 + 1
    const ease = 1 + c3 * Math.pow(progress - 1, 3) + c1 * Math.pow(progress - 1, 2)

    // Âm thanh leng keng micro khi khung ảnh vừa bay tới vị trí
    if (progress >= 0.85 && !hasPlayedSpawnSound.current && index < 6) {
      hasPlayedSpawnSound.current = true
      soundEngine.playSparkle()
    }

    // Tọa độ nội suy từ tâm (0,0,0) ra tọa độ chỉ định
    const currentX = THREE.MathUtils.lerp(0, position[0], ease)
    const currentY = THREE.MathUtils.lerp(0, position[1], ease)
    const currentZ = THREE.MathUtils.lerp(0, position[2], ease)
    groupRef.current.position.set(currentX, currentY, currentZ)

    // Xoay nhẹ từ góc nghiêng về góc xoắn ốc chuẩn
    const currentRotX = THREE.MathUtils.lerp(rotation[0] + 0.5, rotation[0], progress)
    const currentRotY = THREE.MathUtils.lerp(rotation[1] + 1.2, rotation[1], progress)
    const currentRotZ = THREE.MathUtils.lerp(0.2, rotation[2] || 0, progress)
    groupRef.current.rotation.set(currentRotX, currentRotY, currentRotZ)

    // Scale với hiệu ứng hover và selection
    const targetScale = hovered || isSelected ? 1.16 : 1.0
    const finalScale = ease * targetScale
    groupRef.current.scale.set(finalScale, finalScale, finalScale)

    // Hào quang Halo thở nhịp nhàng (Breathing glow aura)
    if (haloRef.current) {
      const pulse = Math.sin(t * 2.5 + index * 0.6) * 0.15 + 0.85
      const mat = haloRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = (hovered || isSelected ? 0.65 : 0.25) * pulse
    }
  })

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <Float
        speed={hovered ? 0.8 : 2}
        rotationIntensity={0.2}
        floatIntensity={0.5}
        floatingRange={[-0.1, 0.1]}
      >
        <group
          ref={innerRef}
          onClick={handleClick}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        >
          {/* Khung viền kim loại bo góc cao cấp (Metallic Beveled Frame) */}
          <RoundedBox
            args={[2.5, 3.2, 0.06]}
            radius={0.09}
            smoothness={4}
            position={[0, 0, -0.02]}
          >
            <meshStandardMaterial
              color={hovered || isSelected ? '#ff9ebb' : '#1e1b4b'}
              emissive={hovered || isSelected ? '#ff4d79' : '#0f172a'}
              emissiveIntensity={hovered || isSelected ? 0.9 : 0.25}
              roughness={0.22}
              metalness={0.85}
            />
          </RoundedBox>

          {/* Vầng hào quang phát sáng (Border Glow Aura Plane) */}
          <mesh ref={haloRef} position={[0, 0, -0.04]}>
            <planeGeometry args={[2.75, 3.45]} />
            <meshBasicMaterial
              color={hovered || isSelected ? '#f472b6' : '#c084fc'}
              transparent
              opacity={0.25}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>

          {/* Ảnh kỷ niệm độ nét cao */}
          <Image
            url={photo.imageUrl}
            scale={[2.3, 2.7]}
            position={[0, 0.12, 0.03]}
            transparent
            radius={0.08}
          />

          {/* Tiêu đề 3D chữ vàng hồng ánh kim */}
          <Text
            position={[0, -1.35, 0.05]}
            fontSize={0.14}
            color={hovered ? '#ffffff' : '#fbcfe8'}
            anchorX="center"
            anchorY="middle"
            maxWidth={2.2}
          >
            {photo.title}
          </Text>

          {/* Ngày kỷ niệm 3D */}
          <Text
            position={[0, -1.52, 0.05]}
            fontSize={0.095}
            color="#e9d5ff"
            anchorX="center"
            anchorY="middle"
          >
            {photo.date}
          </Text>

          {/* 6 Hạt sao vi mô lơ lửng quanh viền ảnh */}
          {sparkles.map((sp, sIdx) => {
            const timeOffset = sIdx * 1.05
            return (
              <mesh
                key={sIdx}
                position={[
                  Math.cos(timeOffset) * sp.radiusX,
                  Math.sin(timeOffset) * sp.radiusY,
                  0.04,
                ]}
              >
                <sphereGeometry args={[sp.size, 8, 8]} />
                <meshBasicMaterial
                  color="#ffe4e8"
                  transparent
                  opacity={hovered ? 0.95 : 0.6}
                  blending={THREE.AdditiveBlending}
                  depthWrite={false}
                />
              </mesh>
            )
          })}
        </group>
      </Float>
    </group>
  )
}
