import React, { useMemo, useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useExperienceStore } from '@/store/useExperienceStore'

interface CosmicHeartFireworksProps {
  onComplete?: () => void
}

export const CosmicHeartFireworks: React.FC<CosmicHeartFireworksProps> = ({ onComplete }) => {
  const pointsRef = useRef<THREE.Points>(null!)
  const completeTransition = useExperienceStore((state) => state.completeTransition)
  const currentPhase = useExperienceStore((state) => state.currentPhase)

  const particleCount = 1800
  const animTime = useRef(0)

  // Tạo các tọa độ hình trái tim 3D (3D Parametric Heart)
  const { initialPositions, heartPositions, explosionVelocities, colors } = useMemo(() => {
    const initPos = new Float32Array(particleCount * 3)
    const heartPos = new Float32Array(particleCount * 3)
    const expVel = new Float32Array(particleCount * 3)
    const cols = new Float32Array(particleCount * 3)

    const palette = [
      new THREE.Color('#ff2a85'), // Hot pink
      new THREE.Color('#ff70a6'), // Soft rose
      new THREE.Color('#ffd1dc'), // Pastel pink
      new THREE.Color('#ffb703'), // Golden spark
      new THREE.Color('#ffffff'), // Pure white star
      new THREE.Color('#c084fc'), // Purple starlight
    ]

    for (let i = 0; i < particleCount; i++) {
      // 1. Tọa độ rải rác ban đầu ngoài vũ trụ
      const r = 12 + Math.random() * 20
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(Math.random() * 2 - 1)
      initPos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      initPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      initPos[i * 3 + 2] = r * Math.cos(phi)

      // 2. Tọa độ trên hình trái tim 3D (Công thức tham số)
      const t = Math.random() * Math.PI * 2
      const heartScale = 0.22
      // Thêm một chút nhiễu bên trong thể tích trái tim để tạo khối 3D dày
      const innerSpread = 0.8 + Math.random() * 0.35
      const hx = 16 * Math.pow(Math.sin(t), 3) * heartScale * innerSpread
      const hy =
        (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) *
        heartScale *
        innerSpread
      const hz = (Math.random() - 0.5) * 1.8 // Bề dày trái tim

      heartPos[i * 3] = hx
      heartPos[i * 3 + 1] = hy
      heartPos[i * 3 + 2] = hz

      // 3. Vận tốc bung nổ pháo hoa đa hướng
      const speed = 4.5 + Math.random() * 8.0
      const vDir = new THREE.Vector3(hx, hy, hz)
        .add(
          new THREE.Vector3(
            (Math.random() - 0.5) * 1.5,
            (Math.random() - 0.5) * 1.5,
            (Math.random() - 0.5) * 1.5
          )
        )
        .normalize()
        .multiplyScalar(speed)

      expVel[i * 3] = vDir.x
      expVel[i * 3 + 1] = vDir.y
      expVel[i * 3 + 2] = vDir.z

      // 4. Màu sắc hạt
      const c = palette[Math.floor(Math.random() * palette.length)]
      cols[i * 3] = c.r
      cols[i * 3 + 1] = c.g
      cols[i * 3 + 2] = c.b
    }

    return {
      initialPositions: initPos,
      heartPositions: heartPos,
      explosionVelocities: expVel,
      colors: cols,
    }
  }, [particleCount])

  // Reset thời gian khi vào phase
  useEffect(() => {
    if (currentPhase === 'HEART_FIREWORKS') {
      animTime.current = 0
    }
  }, [currentPhase])

  const currentPos = useMemo(() => new Float32Array(particleCount * 3), [particleCount])

  useFrame((_, delta) => {
    if (currentPhase !== 'HEART_FIREWORKS' || !pointsRef.current) return
    animTime.current += delta

    const t = animTime.current
    const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute
    const array = posAttr.array as Float32Array

    // Giai đoạn 1: Hạt từ ngoài vũ trụ hút vào thành trái tim (0s -> 1.0s)
    if (t < 1.0) {
      const p = Math.min(t / 1.0, 1.0)
      const ease = 1 - Math.pow(1 - p, 3) // Cubic ease out

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3
        array[i3] = THREE.MathUtils.lerp(initialPositions[i3], heartPositions[i3], ease)
        array[i3 + 1] = THREE.MathUtils.lerp(initialPositions[i3 + 1], heartPositions[i3 + 1], ease)
        array[i3 + 2] = THREE.MathUtils.lerp(initialPositions[i3 + 2], heartPositions[i3 + 2], ease)
      }
    }
    // Giai đoạn 2: Trái tim đập 2 nhịp (Heartbeat pulse) (1.0s -> 2.2s)
    else if (t < 2.2) {
      const beatTime = (t - 1.0) * 8.0 // Tần số đập
      const beatScale = 1.0 + Math.sin(beatTime) * Math.exp(-(beatTime % Math.PI)) * 0.18

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3
        array[i3] = heartPositions[i3] * beatScale
        array[i3 + 1] = heartPositions[i3 + 1] * beatScale
        array[i3 + 2] = heartPositions[i3 + 2] * beatScale
      }
    }
    // Giai đoạn 3: Pháo hoa bung nổ bung tỏa ra ngoài (2.2s -> 3.4s)
    else {
      const expTime = t - 2.2
      const drag = Math.max(0.2, 1 - expTime * 0.45)

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3
        array[i3] = heartPositions[i3] + explosionVelocities[i3] * expTime * drag
        array[i3 + 1] =
          heartPositions[i3 + 1] + explosionVelocities[i3 + 1] * expTime * drag - expTime * 0.8 // Trọng lực nhẹ
        array[i3 + 2] = heartPositions[i3 + 2] + explosionVelocities[i3 + 2] * expTime * drag
      }

      // Khi pháo hoa nổ xong (3.4s), tự động mở ra 3D Gallery
      if (t >= 3.4) {
        if (onComplete) onComplete()
        completeTransition()
      }
    }

    posAttr.needsUpdate = true

    // Nhẹ nhàng xoay nhẹ góc nhìn
    pointsRef.current.rotation.y += delta * 0.3
  })

  if (currentPhase !== 'HEART_FIREWORKS') return null

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[currentPos, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.16}
        vertexColors
        transparent
        opacity={0.95}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}
