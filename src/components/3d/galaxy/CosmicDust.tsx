import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useExperienceStore } from '@/store/useExperienceStore'

interface CosmicDustProps {
  count?: number
}

export const CosmicDust: React.FC<CosmicDustProps> = ({ count = 2800 }) => {
  const pointsRef = useRef<THREE.Points>(null!)
  const currentPhase = useExperienceStore((state) => state.currentPhase)

  // Tạo positions và colors ngẫu nhiên cho các hạt sao (màu pastel: hồng, tím, trắng, vàng nhạt)
  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)

    const palette = [
      new THREE.Color('#ffb6c1'), // Light pink
      new THREE.Color('#ffd1dc'), // Pastel rose
      new THREE.Color('#e6e6fa'), // Lavender
      new THREE.Color('#fff4bd'), // Starlight gold
      new THREE.Color('#ffffff'), // Pure white
      new THREE.Color('#d8b4fe'), // Soft purple
    ]

    for (let i = 0; i < count; i++) {
      // Phân bố hạt trong hình cầu bán kính 30
      const radius = 5 + Math.random() * 35
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(Math.random() * 2 - 1)

      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      pos[i * 3 + 2] = radius * Math.cos(phi)

      const c = palette[Math.floor(Math.random() * palette.length)]
      col[i * 3] = c.r
      col[i * 3 + 1] = c.g
      col[i * 3 + 2] = c.b
    }

    return [pos, col]
  }, [count])

  useFrame((_, delta) => {
    if (!pointsRef.current) return

    if (currentPhase === 'WARP') {
      // Hiệu ứng siêu tốc: Quay cực nhanh và hút hạt
      pointsRef.current.rotation.z += delta * 1.5
      pointsRef.current.rotation.y += delta * 0.8
    } else {
      // Quay nhẹ nhàng tự nhiên
      pointsRef.current.rotation.y += delta * 0.03
      pointsRef.current.rotation.x += delta * 0.015
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={currentPhase === 'WARP' ? 0.16 : 0.09}
        vertexColors
        transparent
        opacity={0.85}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}
