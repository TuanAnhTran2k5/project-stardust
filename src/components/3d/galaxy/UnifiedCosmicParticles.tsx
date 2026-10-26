import React, { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useExperienceStore } from '@/store/useExperienceStore'

// Tạo texture hạt sáng tròn mịn toả hào quang (không răng cưa, không hạt vuông)
function createGlowDotTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext('2d')
  if (ctx) {
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 30)
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
    gradient.addColorStop(0.2, 'rgba(255, 215, 230, 0.95)')
    gradient.addColorStop(0.5, 'rgba(255, 20, 147, 0.6)')
    gradient.addColorStop(0.8, 'rgba(255, 20, 147, 0.15)')
    gradient.addColorStop(1, 'rgba(255, 20, 147, 0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 64, 64)
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

export const UnifiedCosmicParticles: React.FC = () => {
  const pointsRef = useRef<THREE.Points>(null!)
  const { size } = useThree()
  const currentPhase = useExperienceStore((state) => state.currentPhase)

  const particleCount = 3800

  const glowTexture = useMemo(() => createGlowDotTexture(), [])

  // Tỷ lệ màn hình (Aspect ratio)
  const isMobile = size.width < 768 || size.width / size.height < 1.0

  // Tính toán toạ độ nền vũ trụ & dải ngân hà
  const { initialDustPositions, galleryDustPositions, colors } =
    useMemo(() => {
      const dust = new Float32Array(particleCount * 3)
      const galDust = new Float32Array(particleCount * 3)
      const cols = new Float32Array(particleCount * 3)

      const palette = [
        new THREE.Color('#ff0055'), // Ruby red
        new THREE.Color('#ff1493'), // Deep pink
        new THREE.Color('#ff69b4'), // Hot pink
        new THREE.Color('#ffb6c1'), // Soft sakura
        new THREE.Color('#ffd700'), // Gold spark
        new THREE.Color('#ffffff'), // Starlight white
      ]

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3

        // 1. Tọa độ hạt sao lơ lửng ban đầu ở màn hình Login
        const r1 = 8 + Math.random() * 24
        const theta1 = Math.random() * Math.PI * 2
        const phi1 = Math.acos(Math.random() * 2 - 1)
        dust[i3] = r1 * Math.sin(phi1) * Math.cos(theta1)
        dust[i3 + 1] = r1 * Math.sin(phi1) * Math.sin(theta1)
        dust[i3 + 2] = r1 * Math.cos(phi1)

        // 2. Tọa độ nền dải ngân hà lung linh cho trang GALLERY (KHÔNG để nền đen trống)
        const r2 = 6 + Math.random() * 26
        const theta2 = Math.random() * Math.PI * 2
        const phi2 = Math.acos(Math.random() * 2 - 1)
        galDust[i3] = r2 * Math.sin(phi2) * Math.cos(theta2)
        galDust[i3 + 1] = r2 * Math.sin(phi2) * Math.sin(theta2)
        galDust[i3 + 2] = r2 * Math.cos(phi2)

        // 3. Màu sắc hạt vũ trụ
        const c = palette[Math.floor(Math.random() * palette.length)]
        cols[i3] = c.r
        cols[i3 + 1] = c.g
        cols[i3 + 2] = c.b
      }

      return {
        initialDustPositions: dust,
        galleryDustPositions: galDust,
        colors: cols,
      }
    }, [particleCount])

  const currentPositions = useMemo(
    () => new Float32Array(initialDustPositions),
    [initialDustPositions]
  )

  useFrame((_, delta) => {
    if (!pointsRef.current) return
    const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute
    const array = posAttr.array as Float32Array
    const mat = pointsRef.current.material as THREE.PointsMaterial

    // -------------------------------------------------------------------------
    // 1. MÀN HÌNH ĐĂNG NHẬP & CHUYỂN CẢNH PUBG: Hạt lơ lửng dịu dàng
    // -------------------------------------------------------------------------
    if (currentPhase === 'LOGIN' || currentPhase === 'PUBG_TRANSITION') {
      pointsRef.current.visible = true
      mat.opacity = currentPhase === 'PUBG_TRANSITION' ? 0.25 : 0.85
      mat.size = isMobile ? 0.16 : 0.22
      pointsRef.current.rotation.y += delta * 0.02
      pointsRef.current.rotation.x += delta * 0.01

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3
        array[i3] = initialDustPositions[i3]
        array[i3 + 1] = initialDustPositions[i3 + 1]
        array[i3 + 2] = initialDustPositions[i3 + 2]
      }
      posAttr.needsUpdate = true
      return
    }

    // -------------------------------------------------------------------------
    // 2. CHUYỂN CẢNH TRÁI TIM & PHÁO HOA: Nhường sân khấu cho HeartParticleVisual
    // -------------------------------------------------------------------------
    if (currentPhase === 'HEART_FIREWORKS') {
      pointsRef.current.visible = false
      return
    }

    // -------------------------------------------------------------------------
    // 3. KHÔNG GIAN 3D GALLERY: Hạt sao biến thành DẢI NGÂN HÀ LUNG LINH QUANH ALBUM
    // GIẢI QUYẾT TRIỆT ĐỂ: "sao không có nền đẹp như trang login"
    // -------------------------------------------------------------------------
    if (currentPhase === 'GALLERY') {
      pointsRef.current.visible = true
      mat.opacity = 0.8
      mat.size = isMobile ? 0.16 : 0.22

      // Xoay nhẹ nhàng 360 độ quanh album ảnh kỷ niệm
      pointsRef.current.rotation.y += delta * 0.03
      pointsRef.current.rotation.x += delta * 0.015

      // Tự động phân bổ hạt thành bầu trời sao ngân hà bao bọc toàn cảnh
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3
        array[i3] = THREE.MathUtils.lerp(array[i3], galleryDustPositions[i3], delta * 2.0)
        array[i3 + 1] = THREE.MathUtils.lerp(array[i3 + 1], galleryDustPositions[i3 + 1], delta * 2.0)
        array[i3 + 2] = THREE.MathUtils.lerp(array[i3 + 2], galleryDustPositions[i3 + 2], delta * 2.0)
      }
      posAttr.needsUpdate = true
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[currentPositions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={glowTexture}
        size={isMobile ? 0.18 : 0.24}
        vertexColors
        transparent
        opacity={0.88}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}
