import React, { useRef, useEffect, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { CHARACTER_ASSETS } from '@/constants/characterAssets'
import { useExperienceStore } from '@/store/useExperienceStore'

/**
 * Helper tạo CanvasTexture với hiệu ứng Vignette Radial Blending
 * Mép ngoài 4 góc mờ dần về trong suốt (Alpha = 0), hòa tan 100% tự nhiên vào biển hạt sao,
 * xóa bỏ hoàn toàn khung viền tròn cứng.
 */
function createSeamlessAvatarTexture(imageSrc: string): Promise<THREE.CanvasTexture> {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const size = 512
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')
      if (ctx) {
        // 1. Vẽ ảnh chân dung vào canvas, lấy phần gương mặt đẹp nhất
        const minDim = Math.min(img.width, img.height)
        const sx = (img.width - minDim) / 2
        const sy = (img.height - minDim) * 0.22
        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size)

        // 2. Kỹ thuật Radial Gradient Mask Blending (destination-in):
        // Tâm gương mặt (0 - 45%) rõ nét 100%, mép ngoài (45% - 75%) mờ dần vào vũ trụ
        ctx.globalCompositeOperation = 'destination-in'
        const grad = ctx.createRadialGradient(
          size / 2,
          size / 2,
          size * 0.22,
          size / 2,
          size / 2,
          size * 0.48
        )
        grad.addColorStop(0, 'rgba(0, 0, 0, 1.0)') // Tâm rõ nét
        grad.addColorStop(0.5, 'rgba(0, 0, 0, 1.0)') // Vùng mặt 100% rõ
        grad.addColorStop(0.75, 'rgba(0, 0, 0, 0.45)') // Bắt đầu hòa tan
        grad.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)') // Rìa 0% trong suốt tuyệt đối

        ctx.fillStyle = grad
        ctx.fillRect(0, 0, size, size)
      }
      const texture = new THREE.CanvasTexture(canvas)
      texture.needsUpdate = true
      resolve(texture)
    }
    img.src = imageSrc
  })
}

export const HeartAvatarMedallion: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null!)
  const avatarMeshRef = useRef<THREE.Mesh>(null!)
  const glowLightRef = useRef<THREE.PointLight>(null!)

  const [avatarTexture, setAvatarTexture] = useState<THREE.CanvasTexture | null>(null)
  const currentPhase = useExperienceStore((state) => state.currentPhase)
  const { size } = useThree()

  const isMobile = size.width < 768 || size.width / size.height < 1.0
  const baseScale = isMobile ? 1.15 : 1.45

  const animTime = useRef(0)

  useEffect(() => {
    createSeamlessAvatarTexture(CHARACTER_ASSETS.femaleAvatar).then((tex) => {
      setAvatarTexture(tex)
    })
  }, [])

  useEffect(() => {
    if (currentPhase === 'HEART_FIREWORKS') {
      animTime.current = 0
    }
  }, [currentPhase])

  useFrame((_, delta) => {
    if (!groupRef.current) return

    if (currentPhase === 'HEART_FIREWORKS') {
      animTime.current += delta
      const t = animTime.current

      // Giai đoạn 1 (0s -> 1.2s): Trái tim nở bung, hình bóng người thương hòa tan từ tốn xuất hiện
      if (t < 1.2) {
        groupRef.current.visible = true
        const alpha = Math.min(t / 1.0, 1.0)
        const scale = baseScale * (0.6 + alpha * 0.4)
        groupRef.current.scale.set(scale, scale, scale)

        if (avatarMeshRef.current) {
          ;(avatarMeshRef.current.material as THREE.MeshBasicMaterial).opacity = alpha * 0.95
        }
      }
      // Giai đoạn 2 (1.2s -> 6.5s): Nhịp tim đập thổn thức -> Ảnh chân dung co giãn nhẹ theo nhịp
      else if (t < 6.5) {
        groupRef.current.visible = true
        const beatCycle = (t - 1.2) * 3.5
        const pulse = Math.sin(beatCycle) * Math.exp(-(beatCycle % Math.PI)) * 0.12
        const currentScale = baseScale * (1.0 + Math.max(0, pulse))
        groupRef.current.scale.set(currentScale, currentScale, currentScale)

        if (avatarMeshRef.current) {
          ;(avatarMeshRef.current.material as THREE.MeshBasicMaterial).opacity = 0.96
        }

        if (glowLightRef.current) {
          glowLightRef.current.intensity = 3.0 + Math.max(0, pulse) * 5.0
        }
      }
      // Giai đoạn 3 (6.5s -> 9.5s): Pháo hoa bung tỏa -> Ảnh nhẹ nhàng bay tan vào ngàn sao
      else if (t < 9.0) {
        const fadeP = Math.min((t - 6.5) / 1.8, 1.0)
        const burstScale = baseScale * (1.0 + fadeP * 1.5)
        groupRef.current.scale.set(burstScale, burstScale, burstScale)

        if (avatarMeshRef.current) {
          ;(avatarMeshRef.current.material as THREE.MeshBasicMaterial).opacity = Math.max(
            0,
            1.0 - fadeP * 1.2
          )
        }
        if (glowLightRef.current) {
          glowLightRef.current.intensity = Math.max(0, 6.0 * (1 - fadeP))
        }
      } else {
        groupRef.current.visible = false
      }
    } else {
      groupRef.current.visible = false
    }
  })

  if (!avatarTexture) return null

  return (
    <group ref={groupRef} position={[0, 0.22, 0.25]} visible={false}>
      {/* 
        Ảnh chân dung hòa trộn tự nhiên (Seamless Blended Avatar):
        - Không có khung viền tròn cứng (đã gỡ bỏ 2 ring vàng và hồng)
        - Dùng texture vignette gradient tự động mờ dần rìa ngoài vào biển hạt sao
      */}
      <mesh ref={avatarMeshRef}>
        <planeGeometry args={[1.5, 1.5]} />
        <meshBasicMaterial
          map={avatarTexture}
          transparent={true}
          opacity={0}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Ánh sáng ấm dịu nhẹ tỏa ra từ tâm chân dung */}
      <pointLight
        ref={glowLightRef}
        position={[0, 0, 0.5]}
        color="#ff7597"
        intensity={3.0}
        distance={5}
        decay={2}
      />
    </group>
  )
}
