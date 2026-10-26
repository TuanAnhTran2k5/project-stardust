import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface HeartBulletProps {
  startPos: [number, number, number]
  targetPos: [number, number, number]
  progress: number // 0 to 1
  isFlying: boolean
  hasImpacted: boolean
}

// Tạo texture hạt sáng cho vệt đuôi đạn
function createSparkleTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 32
  canvas.height = 32
  const ctx = canvas.getContext('2d')
  if (ctx) {
    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 15)
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
    gradient.addColorStop(0.3, 'rgba(255, 105, 180, 0.9)')
    gradient.addColorStop(0.7, 'rgba(255, 20, 147, 0.4)')
    gradient.addColorStop(1, 'rgba(255, 20, 147, 0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 32, 32)
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

export const HeartBullet3D: React.FC<HeartBulletProps> = ({
  startPos,
  targetPos,
  progress,
  isFlying,
  hasImpacted,
}) => {
  const bulletGroupRef = useRef<THREE.Group>(null!)
  const trailPointsRef = useRef<THREE.Points>(null!)
  const shockwaveRef = useRef<THREE.Mesh>(null!)

  const trailTexture = useMemo(() => createSparkleTexture(), [])

  // Tạo đường cong Bezier 3D mềm mại cho quỹ đạo bay
  const curve = useMemo(() => {
    const vStart = new THREE.Vector3(...startPos)
    const vEnd = new THREE.Vector3(...targetPos)
    // Điểm kiểm soát uốn lượn nhẹ tạo cảm giác đường đạn bắn tỉa bay vút trực diện
    const midX = (vStart.x + vEnd.x) * 0.5
    const midY = (vStart.y + vEnd.y) * 0.5 + 0.35
    const midZ = (vStart.z + vEnd.z) * 0.5 + 0.3
    const vControl = new THREE.Vector3(midX, midY, midZ)
    return new THREE.QuadraticBezierCurve3(vStart, vControl, vEnd)
  }, [startPos, targetPos])

  // Lịch sử hạt vệt đuôi (Trail history)
  const trailCount = 60
  const trailPositions = useMemo(() => new Float32Array(trailCount * 3), [trailCount])
  const trailHistory = useRef<THREE.Vector3[]>([])

  useFrame((_, delta) => {
    if (!bulletGroupRef.current) return

    if (isFlying && !hasImpacted) {
      bulletGroupRef.current.visible = true
      const clampedP = THREE.MathUtils.clamp(progress, 0, 1)

      // Vị trí hiện tại trên đường cong
      const currentPos = curve.getPoint(clampedP)
      bulletGroupRef.current.position.copy(currentPos)

      // Hướng quay của viên đạn luôn bám theo tiếp tuyến chuyển động
      const tangent = curve.getTangent(clampedP).normalize()
      const lookTarget = currentPos.clone().add(tangent)
      bulletGroupRef.current.lookAt(lookTarget)

      // Cập nhật vệt đuôi đạn phát sáng
      trailHistory.current.unshift(currentPos.clone())
      if (trailHistory.current.length > trailCount) {
        trailHistory.current.pop()
      }

      if (trailPointsRef.current) {
        const posAttr = trailPointsRef.current.geometry.attributes.position as THREE.BufferAttribute
        const arr = posAttr.array as Float32Array

        for (let i = 0; i < trailCount; i++) {
          const i3 = i * 3
          if (i < trailHistory.current.length) {
            const p = trailHistory.current[i]
            // Rung nhẹ jitter tạo hiệu ứng hạt năng lượng ma sát không khí
            const jitter = (Math.random() - 0.5) * 0.08 * (i / trailCount)
            arr[i3] = p.x + jitter
            arr[i3 + 1] = p.y + jitter
            arr[i3 + 2] = p.z + jitter
          } else {
            arr[i3] = currentPos.x
            arr[i3 + 1] = currentPos.y
            arr[i3 + 2] = currentPos.z
          }
        }
        posAttr.needsUpdate = true
      }
    } else {
      bulletGroupRef.current.visible = false
    }

    // Hiệu ứng sóng xung kích hình trái tim (Shockwave bloom) khi va chạm ngực trái
    if (shockwaveRef.current) {
      if (hasImpacted) {
        shockwaveRef.current.visible = true
        shockwaveRef.current.position.set(...targetPos)
        shockwaveRef.current.scale.addScalar(delta * 4.5)
        const mat = shockwaveRef.current.material as THREE.MeshBasicMaterial
        mat.opacity = Math.max(0, mat.opacity - delta * 1.4)
      } else {
        shockwaveRef.current.visible = false
        shockwaveRef.current.scale.set(0.1, 0.1, 0.1)
        const mat = shockwaveRef.current.material as THREE.MeshBasicMaterial
        mat.opacity = 0.95
      }
    }
  })

  return (
    <group>
      {/* 1. Viên đạn 3D cách điệu (Thân đồng ánh kim + Đầu đạn Laser hồng Neon) */}
      <group ref={bulletGroupRef} visible={false}>
        {/* Thân vỏ đạn (Brass Cartridge) */}
        <mesh position={[0, 0, -0.25]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.07, 0.07, 0.35, 16]} />
          <meshStandardMaterial
            color="#e6b800"
            metalness={0.9}
            roughness={0.2}
            emissive="#b38600"
            emissiveIntensity={0.3}
          />
        </mesh>

        {/* Đầu đạn hình nón năng lượng tình yêu (Love Bullet Nose) */}
        <mesh position={[0, 0, 0.05]} rotation={[-Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.075, 0.28, 16]} />
          <meshStandardMaterial
            color="#ff1493"
            emissive="#ff007f"
            emissiveIntensity={3.5}
            roughness={0.1}
          />
        </mesh>

        {/* Hào quang phát sáng bao quanh viên đạn (Heart Energy Core) */}
        <pointLight color="#ff1493" intensity={6.0} distance={4.0} decay={2} />

        <mesh scale={[0.22, 0.22, 0.35]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshBasicMaterial
            color="#ff69b4"
            transparent
            opacity={0.4}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* 2. Vệt đuôi hạt phát sáng theo sau viên đạn (Sparkle Particle Trail) */}
      <points ref={trailPointsRef} visible={isFlying && !hasImpacted}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[trailPositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.28}
          map={trailTexture}
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          color="#ff69b4"
        />
      </points>

      {/* 3. Vòng sóng xung kích lan tỏa khi trúng ngực trái (Impact Shockwave Ring) */}
      <mesh ref={shockwaveRef} visible={false}>
        <ringGeometry args={[0.4, 0.7, 32]} />
        <meshBasicMaterial
          color="#ff1493"
          transparent
          opacity={0.9}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}
