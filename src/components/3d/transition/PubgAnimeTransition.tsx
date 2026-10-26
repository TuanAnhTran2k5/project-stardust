import React, { useRef, useState, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { CHARACTER_ASSETS, getResponsiveTransitionLayout } from '@/constants/characterAssets'
import { HeartBullet3D } from './HeartBullet3D'
import { soundEngine } from '@/utils/soundEffects'
import { useExperienceStore } from '@/store/useExperienceStore'

export const PubgAnimeTransition: React.FC = () => {
  const { size } = useThree()
  const triggerHeartFireworks = useExperienceStore((state) => state.triggerHeartFireworks)
  const setPubgSubPhase = useExperienceStore((state) => state.setPubgSubPhase)

  // Phát hiện màn hình di động / màn hình dọc
  const isMobile = size.width < 768 || size.width / size.height < 1.0
  const layout = getResponsiveTransitionLayout(isMobile)

  // Nạp 2 ảnh nhân vật Anime đã tách nền trong suốt 100%
  const femaleTexture = useTexture(CHARACTER_ASSETS.femaleSniper)
  const maleTexture = useTexture(CHARACTER_ASSETS.maleReceiver)

  // References cho các mesh nhân vật và hiệu ứng
  const femaleRef = useRef<THREE.Mesh>(null!)
  const maleRef = useRef<THREE.Mesh>(null!)
  const laserRef = useRef<THREE.Line>(null!)
  const muzzleFlashRef = useRef<THREE.Mesh>(null!)
  const chestGlowRef = useRef<THREE.PointLight>(null!)
  const auraFemaleRef = useRef<THREE.PointLight>(null!)
  const auraMaleRef = useRef<THREE.PointLight>(null!)

  // Trạng thái timeline
  const elapsedTime = useRef(0)
  const [bulletProgress, setBulletProgress] = useState(0)
  const [isFlying, setIsFlying] = useState(false)
  const [hasImpacted, setHasImpacted] = useState(false)

  // Tránh trigger âm thanh nhiều lần
  const hasPlayedBolt = useRef(false)
  const hasPlayedShot = useRef(false)
  const hasPlayedFly = useRef(false)
  const hasPlayedImpact = useRef(false)
  const hasCompleted = useRef(false)

  useEffect(() => {
    elapsedTime.current = 0
    hasPlayedBolt.current = false
    hasPlayedShot.current = false
    hasPlayedFly.current = false
    hasPlayedImpact.current = false
    hasCompleted.current = false
    setBulletProgress(0)
    setIsFlying(false)
    setHasImpacted(false)
    setPubgSubPhase('AIMING')
  }, [setPubgSubPhase])

  useFrame((_, delta) => {
    elapsedTime.current += delta
    const t = elapsedTime.current

    // -------------------------------------------------------------------------
    // 1. Giai đoạn 0.0s -> 1.2s: READY & LÊN ĐẠN AWM (Bolt-Action)
    // -------------------------------------------------------------------------
    if (t < 1.2) {
      if (t > 0.15 && !hasPlayedBolt.current) {
        hasPlayedBolt.current = true
        soundEngine.playBoltAction()
        setPubgSubPhase('AIMING')
      }

      // Fade-in nhân vật mượt mà
      const fadeIn = Math.min(t / 0.8, 1.0)
      if (femaleRef.current) {
        ;(femaleRef.current.material as THREE.MeshBasicMaterial).opacity = fadeIn * 0.98
      }
      if (maleRef.current) {
        ;(maleRef.current.material as THREE.MeshBasicMaterial).opacity = fadeIn * 0.98
      }

      // Tia laser ngắm bắn hồng phát sáng hướng thẳng vào tim
      if (laserRef.current) {
        laserRef.current.visible = true
        const laserMat = laserRef.current.material as THREE.LineBasicMaterial
        laserMat.opacity = Math.sin(t * 8) * 0.25 + 0.55
      }

      setIsFlying(false)
      setHasImpacted(false)
    }
    // -------------------------------------------------------------------------
    // 2. Giai đoạn 1.2s -> 3.2s: BẮN SÚNG TỈA AWM & ĐẠN BAY XÉ GIÓ
    // -------------------------------------------------------------------------
    else if (t < 3.2) {
      if (!hasPlayedShot.current) {
        hasPlayedShot.current = true
        soundEngine.playSniperShot()
        setPubgSubPhase('BULLET_FLIGHT')
      }
      if (!hasPlayedFly.current && t > 1.35) {
        hasPlayedFly.current = true
        soundEngine.playBulletFly()
      }

      // Tắt tia laser sau khi bóp cò
      if (laserRef.current) laserRef.current.visible = false

      // Chớp lửa nòng súng (Muzzle Flash Starburst) ở 1.2s -> 1.5s
      if (muzzleFlashRef.current) {
        if (t < 1.5) {
          muzzleFlashRef.current.visible = true
          const flashProgress = (t - 1.2) / 0.3
          const scale = (1 - flashProgress) * 2.0
          muzzleFlashRef.current.scale.set(scale, scale, scale)
          ;(muzzleFlashRef.current.material as THREE.MeshBasicMaterial).opacity = 1 - flashProgress
        } else {
          muzzleFlashRef.current.visible = false
        }
      }

      // Tiến trình bay của viên đạn từ 1.25s đến 3.15s (thời gian bay 1.9s chậm rãi rõ nét)
      const flightDuration = 1.9
      const currentFlightTime = t - 1.25
      const p = Math.max(0, Math.min(currentFlightTime / flightDuration, 1.0))
      // Smooth step easing
      const easedP = p * p * (3 - 2 * p)

      setBulletProgress(easedP)
      setIsFlying(true)
      setHasImpacted(false)
    }
    // -------------------------------------------------------------------------
    // 3. Giai đoạn 3.2s -> 5.5s: ĐẠN TRÚNG TIM & CAMERA DOLLY ZOOM VÀO NGỰC
    // -------------------------------------------------------------------------
    else if (t < 5.5) {
      if (!hasPlayedImpact.current) {
        hasPlayedImpact.current = true
        soundEngine.playHeartImpact()
        setIsFlying(false)
        setHasImpacted(true)
        setPubgSubPhase('CHEST_ZOOM')
      }

      // Ánh sáng trái tim ngực trái bừng sáng rực rỡ
      if (chestGlowRef.current) {
        const glowPhase = t - 3.2
        chestGlowRef.current.intensity = Math.sin(glowPhase * 3.5) * 4.0 + 8.0
      }

      // Nhân vật nam rung nhẹ theo nhịp đập thổn thức
      if (maleRef.current) {
        const heartShock = Math.sin((t - 3.2) * 16) * Math.exp(-(t - 3.2) * 1.5) * 0.1
        maleRef.current.position.y = layout.malePosition[1] + heartShock
      }

      // Dần dần mờ tan vào vũ trụ từ 4.5s -> 5.5s
      if (t > 4.5) {
        const fadeOut = Math.max(0, 1.0 - (t - 4.5) / 1.0)
        if (femaleRef.current) {
          ;(femaleRef.current.material as THREE.MeshBasicMaterial).opacity = fadeOut
        }
        if (maleRef.current) {
          ;(maleRef.current.material as THREE.MeshBasicMaterial).opacity = fadeOut
        }
      }
    }
    // -------------------------------------------------------------------------
    // 4. Kết thúc (5.5s+): Bàn giao mượt mà sang Phase HEART_FIREWORKS
    // -------------------------------------------------------------------------
    else {
      if (!hasCompleted.current) {
        hasCompleted.current = true
        triggerHeartFireworks()
      }
    }

    // Hiệu ứng thở / lơ lửng bồng bềnh nhẹ nhàng trong không gian
    const floatFemale = Math.sin(t * 1.6) * 0.08
    const floatMale = Math.cos(t * 1.6) * 0.08
    if (femaleRef.current) {
      femaleRef.current.position.y = layout.femalePosition[1] + floatFemale
    }
    if (maleRef.current && t < 3.2) {
      maleRef.current.position.y = layout.malePosition[1] + floatMale
    }
  })

  // Khởi tạo hình học tia laser ngắm bắn
  const laserGeometry = React.useMemo(() => {
    const geom = new THREE.BufferGeometry()
    const points = [
      new THREE.Vector3(...layout.bulletStart),
      new THREE.Vector3(...layout.bulletTarget),
    ]
    geom.setFromPoints(points)
    return geom
  }, [layout.bulletStart, layout.bulletTarget])

  return (
    <group>
      {/* Hào quang nền xanh tím & hồng phía sau 2 nhân vật */}
      <pointLight
        ref={auraFemaleRef}
        position={[layout.femalePosition[0], layout.femalePosition[1], layout.femalePosition[2] - 0.5]}
        color="#38bdf8"
        intensity={2.5}
        distance={7}
      />
      <pointLight
        ref={auraMaleRef}
        position={[layout.malePosition[0], layout.malePosition[1], layout.malePosition[2] - 0.5]}
        color="#f472b6"
        intensity={3.0}
        distance={7}
      />

      {/* 1. Nhân vật Nữ AWM Sniper (PlaneMesh với ảnh tách nền trong suốt) */}
      <mesh
        ref={femaleRef}
        position={layout.femalePosition}
        scale={layout.femaleScale}
        rotation={layout.femaleRotation}
      >
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          map={femaleTexture}
          transparent={true}
          opacity={0}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 2. Nhân vật Nam nhận đạn tình yêu (PlaneMesh với ảnh tách nền trong suốt) */}
      <mesh
        ref={maleRef}
        position={layout.malePosition}
        scale={layout.maleScale}
        rotation={layout.maleRotation}
      >
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          map={maleTexture}
          transparent={true}
          opacity={0}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 3. Tia Laser ngắm bắn chuẩn xác từ nòng súng đến tim */}
      <primitive
        object={
          new THREE.Line(
            laserGeometry,
            new THREE.LineBasicMaterial({
              color: '#ff1493',
              transparent: true,
              opacity: 0.6,
              blending: THREE.AdditiveBlending,
            })
          )
        }
        ref={laserRef}
      />

      {/* 4. Chớp lửa nòng súng AWM (Muzzle Flash Starburst) */}
      <mesh ref={muzzleFlashRef} position={layout.bulletStart} visible={false}>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshBasicMaterial
          color="#ff69b4"
          transparent={true}
          opacity={0.9}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 5. Hệ thống Viên đạn Trái Tim 3D & Vệt đuôi sao băng */}
      <HeartBullet3D
        startPos={layout.bulletStart}
        targetPos={layout.bulletTarget}
        progress={bulletProgress}
        isFlying={isFlying}
        hasImpacted={hasImpacted}
      />

      {/* 6. Ánh sáng trái tim ngực trái khi đạn chạm tim */}
      <pointLight
        ref={chestGlowRef}
        position={layout.bulletTarget}
        color="#ff1493"
        intensity={hasImpacted ? 8.0 : 0}
        distance={8}
        decay={2}
      />
    </group>
  )
}
