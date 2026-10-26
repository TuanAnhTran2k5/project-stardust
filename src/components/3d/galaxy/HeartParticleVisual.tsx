import React, { useMemo, useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { soundEngine } from '@/utils/soundEffects'
import confetti from 'canvas-confetti'

export interface HeartParticleVisualProps {
  /** Màu chủ đạo (mặc định: '#FF4D79' neon rose) */
  color?: string
  /** Số lượng hạt phát sáng (mặc định: 15,000 hạt siêu mịn) */
  particleCount?: number
  /** Kích thước hạt micro glitter (mặc định: 0.08 siêu nhỏ như bụi sao) */
  size?: number
  /** Hệ số scale tổng thể */
  scale?: number
  /** Callback kích hoạt khi nổ pháo hoa hoàn tất để chuyển cảnh */
  onComplete?: () => void
}

/**
 * Hàm phân phối chuẩn Gauss (Box-Muller transform)
 * Giúp tạo độ tản khói bụi mờ ảo (dispersion noise) tự nhiên quanh mép viền
 */
function randomGaussian(mean = 0, stdev = 1): number {
  let u = 1 - Math.random()
  let v = Math.random()
  let z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
  return z * stdev + mean
}

/**
 * Tạo Texture hạt phát sáng siêu mịn (Micro Glitter Texture)
 * Tâm trắng phát sáng rực rỡ chuyển tiếp mượt mà sang viền neon hồng phấn trong suốt
 */
function createMicroGlitterTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 32
  canvas.height = 32
  const ctx = canvas.getContext('2d')
  if (ctx) {
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 15)
    grad.addColorStop(0, 'rgba(255, 255, 255, 1.0)') // Tâm trắng chói (White-hot core)
    grad.addColorStop(0.2, 'rgba(255, 220, 235, 0.95)') // Phấn hồng siêu sáng
    grad.addColorStop(0.5, 'rgba(255, 77, 121, 0.6)') // Neon rose pink
    grad.addColorStop(0.8, 'rgba(224, 86, 253, 0.2)') // Ánh tím violet huyền ảo
    grad.addColorStop(1, 'rgba(255, 20, 147, 0)') // Mờ dần trong suốt
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 32, 32)
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

export const HeartParticleVisual: React.FC<HeartParticleVisualProps> = ({
  particleCount: customCount,
  size = 0.085, // Giảm kích thước siêu nhỏ (0.8px - 1.8px) mịn màng như stardust
  scale: customScale,
  onComplete,
}) => {
  const pointsRef = useRef<THREE.Points>(null!)
  const { size: viewportSize } = useThree()

  // Responsive & Performance Scaling: Tự động scale kích thước & số hạt theo Mobile hoặc Desktop
  const isMobile = viewportSize.width < 768 || viewportSize.width / viewportSize.height < 1.0
  const responsiveScale = customScale ?? (isMobile ? 0.115 : 0.14)
  const particleCount = customCount ?? (isMobile ? 9500 : 15000)

  const glowTexture = useMemo(() => createMicroGlitterTexture(), [])
  const animTime = useRef(0)
  const hasTriggeredHeartbeat = useRef(false)
  const hasTriggeredFireworks = useRef(false)

  // =========================================================================
  // THUẬT TOÁN PHÂN BỔ HẠT LẤP ĐẦY TOÀN BỘ LÒNG TRÁI TIM (FILL INTERIOR)
  // =========================================================================
  const { positions, basePositions, colors, dispersalVelocities } = useMemo(() => {
    const pos = new Float32Array(particleCount * 3)
    const basePos = new Float32Array(particleCount * 3)
    const cols = new Float32Array(particleCount * 3)
    const disp = new Float32Array(particleCount * 3)

    // Bảng màu hồng ánh tím phấn (Rose Pink / Neon Magenta / Violet Glow)
    const colorPalette = [
      new THREE.Color('#FFFFFF'), // Tâm sáng chói (White-hot)
      new THREE.Color('#FFE4E8'), // Hồng phấn nhạt
      new THREE.Color('#FF7597'), // Hồng đào neon (Rose pink)
      new THREE.Color('#FF4D79'), // Hồng phấn rực rỡ
      new THREE.Color('#FF1493'), // Neon Magenta
      new THREE.Color('#E056FD'), // Violet ánh tím ngân hà
      new THREE.Color('#FF69B4'), // Hot Pink lấp lánh
    ]

    // 85% hạt: Lấp đầy toàn bộ thể tích lòng trái tim (từ tâm ra viền)
    // 15% hạt: Lớp khói bụi tản nhẹ quanh mép viền (dispersion noise aura)
    const countFilled = Math.floor(particleCount * 0.85)
    const countAura = particleCount - countFilled

    // Hàm toán học phương trình tham số đường cong trái tim gốc
    const getHeartOutline = (t: number) => {
      const sinT = Math.sin(t)
      // x = 16 * sin^3(t)
      const x = 16 * Math.pow(sinT, 3)
      // y = 13*cos(t) - 5*cos(2t) - 2*cos(3t) - cos(4t)
      const y =
        13 * Math.cos(t) -
        5 * Math.cos(2 * t) -
        2 * Math.cos(3 * t) -
        Math.cos(4 * t) +
        5.2 // Offset căn chuẩn trọng tâm tại (0,0)
      return { x, y }
    }

    let pIdx = 0

    // -----------------------------------------------------------------------
    // [VỊ TRÍ 1]: LẤP ĐẦY TOÀN BỘ LÒNG TRÁI TIM VỚI r = sqrt(random())
    // -----------------------------------------------------------------------
    for (let i = 0; i < countFilled; i++, pIdx++) {
      // 1. Góc quay ngẫu nhiên xung quanh đường cong
      const t = Math.random() * Math.PI * 2
      const outline = getHeartOutline(t)

      // 2. CÔNG THỨC LẤP ĐẦY RUỘT:
      // Nhân hệ số bán kính ngẫu nhiên r = sqrt(random()) từ tâm ra viền
      // giúp các hạt phủ kín từ trong ra ngoài, không bị rỗng ruột
      const u = Math.random()
      // Dùng lũy thừa để mật độ đậm đặc nhất ở phần ruột và viền
      const r = Math.pow(u, 0.45)

      // 3. Độ lệch thể tích 3D nhẹ (Volume jitter)
      const jitterX = randomGaussian(0, 0.35)
      const jitterY = randomGaussian(0, 0.35)
      // Chiều sâu Z dày ở giữa tâm và thon lại ở rìa
      const zDepth = randomGaussian(0, 0.7) * (1.1 - r * 0.4)

      const finalX = (outline.x * r + jitterX) * responsiveScale
      const finalY = (outline.y * r + jitterY) * responsiveScale
      const finalZ = zDepth * responsiveScale

      pos[pIdx * 3] = finalX
      pos[pIdx * 3 + 1] = finalY
      pos[pIdx * 3 + 2] = finalZ

      basePos[pIdx * 3] = finalX
      basePos[pIdx * 3 + 1] = finalY
      basePos[pIdx * 3 + 2] = finalZ

      // Màu sắc: Các hạt ở viền và ruột đậm có ánh trắng và hồng phấn neon
      const isCoreBright = r > 0.75 || Math.random() < 0.25
      const color = isCoreBright
        ? colorPalette[Math.floor(Math.random() * 4)] // Trắng và hồng sáng
        : colorPalette[Math.floor(Math.random() * colorPalette.length)]

      cols[pIdx * 3] = color.r
      cols[pIdx * 3 + 1] = color.g
      cols[pIdx * 3 + 2] = color.b

      // Vector bay pháo hoa
      disp[pIdx * 3] = finalX * 2.8 + (Math.random() - 0.5) * 4.0
      disp[pIdx * 3 + 1] = finalY * 2.8 + (Math.random() - 0.5) * 4.0
      disp[pIdx * 3 + 2] = (Math.random() - 0.5) * 6.0
    }

    // -----------------------------------------------------------------------
    // [VỊ TRÍ 2]: LỚP BỤI HẠT BAY TẢN MỜ ẢO QUANH MÉP VIỀN (SOFT GLOW AURA)
    // -----------------------------------------------------------------------
    for (let i = 0; i < countAura; i++, pIdx++) {
      const t = Math.random() * Math.PI * 2
      const outline = getHeartOutline(t)

      // Tản nhẹ ra ngoài rìa viền (r từ 1.0 đến 1.35)
      const auraDist = 1.0 + Math.abs(randomGaussian(0, 0.18))
      const auraJitterX = randomGaussian(0, 0.6)
      const auraJitterY = randomGaussian(0, 0.6)
      const auraZ = randomGaussian(0, 1.2)

      const finalX = (outline.x * auraDist + auraJitterX) * responsiveScale
      const finalY = (outline.y * auraDist + auraJitterY) * responsiveScale
      const finalZ = auraZ * responsiveScale

      pos[pIdx * 3] = finalX
      pos[pIdx * 3 + 1] = finalY
      pos[pIdx * 3 + 2] = finalZ

      basePos[pIdx * 3] = finalX
      basePos[pIdx * 3 + 1] = finalY
      basePos[pIdx * 3 + 2] = finalZ

      // Khói bụi tản ngoài ánh tím violet & hồng đào
      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)]
      cols[pIdx * 3] = color.r * 0.9
      cols[pIdx * 3 + 1] = color.g * 0.8
      cols[pIdx * 3 + 2] = color.b * 0.95

      disp[pIdx * 3] = finalX * 3.2 + (Math.random() - 0.5) * 5.5
      disp[pIdx * 3 + 1] = finalY * 3.2 + (Math.random() - 0.5) * 5.5
      disp[pIdx * 3 + 2] = (Math.random() - 0.5) * 7.5
    }

    return {
      positions: pos,
      basePositions: basePos,
      colors: cols,
      dispersalVelocities: disp,
    }
  }, [particleCount, responsiveScale])

  // Dọn dẹp bộ nhớ (Clean up memory) khi unmount
  useEffect(() => {
    return () => {
      glowTexture.dispose()
    }
  }, [glowTexture])

  // =========================================================================
  // VÒNG LẶP RENDER 60FPS: NHỊP ĐẬP TIM & SHIMMER LẤP LÁNH
  // =========================================================================
  useFrame((_, delta) => {
    if (!pointsRef.current) return
    const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute
    const array = posAttr.array as Float32Array
    const mat = pointsRef.current.material as THREE.PointsMaterial

    animTime.current += delta
    const t = animTime.current

    pointsRef.current.rotation.set(0, 0, 0)

    // -------------------------------------------------------------------------
    // Giai đoạn 1: Hạt nở bung từ tâm ra lấp đầy Trái Tim (0.0s -> 1.2s)
    // -------------------------------------------------------------------------
    if (t < 1.2) {
      const p = Math.min(t / 1.2, 1.0)
      const ease = 1 - Math.pow(1 - p, 3.0)
      mat.opacity = 0.98

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3
        array[i3] = basePositions[i3] * ease
        array[i3 + 1] = basePositions[i3 + 1] * ease
        array[i3 + 2] = basePositions[i3 + 2] * ease
      }
    }
    // -------------------------------------------------------------------------
    // Giai đoạn 2: Nhịp Đập Thổn Thức & Shimmer Lấp Lánh (1.2s -> 6.5s)
    // -------------------------------------------------------------------------
    else if (t < 6.5) {
      if (!hasTriggeredHeartbeat.current) {
        hasTriggeredHeartbeat.current = true
        soundEngine.playHeartbeat()
      }

      // Nhịp đập phập phồng đôi chân thực (Thump-thump heartbeat)
      const beatCycle = (t - 1.2) * 3.5
      const pulse = Math.sin(beatCycle) * Math.exp(-(beatCycle % Math.PI)) * 0.12
      const currentScale = 1.0 + Math.max(0, pulse)

      mat.opacity = 0.99

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3
        // Dao động lấp lánh (Twinkle shimmer) ngẫu nhiên như bụi phấn phát sáng
        const shimmer = Math.sin(t * 7.0 + i * 0.3) * 0.012
        const floatZ = Math.cos(t * 3.0 + i * 0.2) * 0.02

        array[i3] = basePositions[i3] * currentScale + shimmer
        array[i3 + 1] = basePositions[i3 + 1] * currentScale + shimmer
        array[i3 + 2] = basePositions[i3 + 2] * currentScale + floatZ
      }
    }
    // -------------------------------------------------------------------------
    // Giai đoạn 3: Đại Pháo Hoa Ngân Hà Bung Nổ (6.5s -> 9.5s)
    // -------------------------------------------------------------------------
    else if (t < 9.5) {
      if (!hasTriggeredFireworks.current) {
        hasTriggeredFireworks.current = true
        soundEngine.playFireworks()
        confetti({
          particleCount: 140,
          spread: 150,
          origin: { y: 0.5 },
          colors: ['#FF4D79', '#FF7597', '#FFE4E8', '#FFD700', '#E056FD', '#FFFFFF'],
        })
      }

      const expTime = t - 6.5
      const fadeOut = Math.max(0, 1.0 - expTime / 2.6)
      mat.opacity = fadeOut * 0.98

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3
        const drag = Math.exp(-expTime * 0.8)
        array[i3] += dispersalVelocities[i3] * delta * drag
        array[i3 + 1] += dispersalVelocities[i3 + 1] * delta * drag - delta * 0.4
        array[i3 + 2] += dispersalVelocities[i3 + 2] * delta * drag
      }
    }
    // -------------------------------------------------------------------------
    // Giai đoạn 4: Hoàn thành hoạt cảnh
    // -------------------------------------------------------------------------
    else {
      pointsRef.current.visible = false
      if (onComplete) onComplete()
    }

    posAttr.needsUpdate = true
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={isMobile ? size * 0.85 : size}
        map={glowTexture}
        vertexColors={true}
        transparent={true}
        opacity={0.98}
        blending={THREE.AdditiveBlending} // Additive Blending: Chồng hạt phát sáng rực rỡ
        depthWrite={false}
      />
    </points>
  )
}
