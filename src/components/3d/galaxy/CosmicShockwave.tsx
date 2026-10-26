import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface CosmicShockwaveProps {
  /** Thời điểm bắt đầu kích nổ sóng xung kích (mặc định: 6.5s) */
  triggerTime?: number
}

/**
 * Hiệu ứng Sóng Xung Kích Ngân Hà (Cosmic Shockwave Nebula Ring)
 * Bung tỏa từ tâm vụ nổ pháo hoa trái tim, quét qua toàn bộ không gian 3D
 */
export const CosmicShockwave: React.FC<CosmicShockwaveProps> = ({
  triggerTime = 6.5,
}) => {
  const innerRingRef = useRef<THREE.Mesh>(null!)
  const outerRingRef = useRef<THREE.Mesh>(null!)
  const glowLightRef = useRef<THREE.PointLight>(null!)
  const animTime = useRef(0)

  useFrame((_, delta) => {
    animTime.current += delta
    const currentT = animTime.current

    if (currentT < triggerTime) {
      if (innerRingRef.current) innerRingRef.current.visible = false
      if (outerRingRef.current) outerRingRef.current.visible = false
      if (glowLightRef.current) glowLightRef.current.intensity = 0
      return
    }

    const t = currentT - triggerTime // 0.0s -> ~3.0s
    if (t > 2.8) {
      if (innerRingRef.current) innerRingRef.current.visible = false
      if (outerRingRef.current) outerRingRef.current.visible = false
      if (glowLightRef.current) glowLightRef.current.intensity = 0
      return
    }

    if (innerRingRef.current) innerRingRef.current.visible = true
    if (outerRingRef.current) outerRingRef.current.visible = true

    // Động học sóng xung kích: Nở cực nhanh lúc đầu rồi giảm tốc nhẹ (Ease-Out Quart)
    const progress = Math.min(t / 2.2, 1.0)
    const easeOut = 1 - Math.pow(1 - progress, 4)
    const currentRadius = easeOut * 32.0

    // Vòng 1: Lõi năng lượng trắng hồng cực sáng (Core Shockwave)
    if (innerRingRef.current) {
      innerRingRef.current.scale.set(currentRadius, currentRadius, 1)
      const mat = innerRingRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = Math.max(0, (1.0 - progress) * 0.95)
    }

    // Vòng 2: Hào quang tím hồng lan tỏa rộng hơn (Outer Nebula Glow)
    if (outerRingRef.current) {
      const outerRadius = currentRadius * 1.25
      outerRingRef.current.scale.set(outerRadius, outerRadius, 1)
      const mat = outerRingRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = Math.max(0, (1.0 - progress) * 0.6)
    }

    // Chớp sáng vũ trụ (Cosmic Flash) tại thời khắc phát nổ (0.0s - 0.35s)
    if (glowLightRef.current) {
      if (t < 0.35) {
        glowLightRef.current.intensity = 25.0 * (1 - t / 0.35)
      } else {
        glowLightRef.current.intensity = 0
      }
    }
  })

  return (
    <group position={[0, 0, 0]}>
      {/* Đèn chớp sáng toàn cảnh lúc nổ */}
      <pointLight
        ref={glowLightRef}
        color="#ffffff"
        intensity={0}
        distance={45}
        decay={2}
      />

      {/* Vòng sóng 1: Lõi trắng hồng sáng chói */}
      <mesh ref={innerRingRef} visible={false}>
        <ringGeometry args={[0.94, 1.0, 64]} />
        <meshBasicMaterial
          color="#FFE4E8"
          transparent
          opacity={0.9}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Vòng sóng 2: Hào quang tím neon mờ ảo */}
      <mesh ref={outerRingRef} visible={false}>
        <ringGeometry args={[0.88, 1.0, 64]} />
        <meshBasicMaterial
          color="#FF4D79"
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}
