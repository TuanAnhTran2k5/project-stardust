import React, { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useExperienceStore } from '@/store/useExperienceStore'
import { useGalleryStore } from '@/store/useGalleryStore'
import { getResponsiveTransitionLayout } from '@/constants/characterAssets'

export const CameraController: React.FC = () => {
  const { camera, size } = useThree()
  const currentPhase = useExperienceStore((state) => state.currentPhase)
  const pubgSubPhase = useExperienceStore((state) => state.pubgSubPhase)
  const focusedPhotoIndex = useGalleryStore((state) => state.focusedPhotoIndex)
  const photos = useGalleryStore((state) => state.photos)

  // Phát hiện màn hình di động / màn hình dọc
  const isMobile = size.width < 768 || size.width / size.height < 1.0

  const warpProgress = useRef(0)
  const targetPos = useRef(new THREE.Vector3(0, 0, 16))
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0))
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0))

  const isTransitioningToOverview = useRef(false)
  const prevFocusedIndex = useRef<number | null>(null)

  // Khi chuyển sang GALLERY hoặc đóng ảnh, kích hoạt nội suy camera mượt mà về vị trí toàn cảnh
  useEffect(() => {
    if (currentPhase === 'GALLERY' && focusedPhotoIndex === null) {
      isTransitioningToOverview.current = true
      targetPos.current.set(0, 1.2, isMobile ? 18.5 : 15.0)
      targetLookAt.current.set(0, 0, 0)
    }
  }, [currentPhase, focusedPhotoIndex, isMobile])

  useEffect(() => {
    if (prevFocusedIndex.current !== null && focusedPhotoIndex === null) {
      isTransitioningToOverview.current = true
      targetPos.current.set(0, 1.2, isMobile ? 18.5 : 14)
      targetLookAt.current.set(0, 0, 0)
    }
    prevFocusedIndex.current = focusedPhotoIndex
  }, [focusedPhotoIndex, isMobile])

  useFrame((_, delta) => {
    if (currentPhase === 'LOGIN') {
      warpProgress.current = 0
      isTransitioningToOverview.current = false
      const loginZ = isMobile ? 18.0 : 15.5

      targetPos.current.set(
        Math.sin(Date.now() * 0.0005) * 0.8,
        Math.cos(Date.now() * 0.0004) * 0.6,
        loginZ
      )
      targetLookAt.current.set(0, 0, 0)

      camera.position.lerp(targetPos.current, delta * 2.0)
      currentLookAt.current.lerp(targetLookAt.current, delta * 2.5)
      camera.lookAt(currentLookAt.current)
    } else if (currentPhase === 'PUBG_TRANSITION') {
      const layout = getResponsiveTransitionLayout(isMobile)

      if (pubgSubPhase === 'CHEST_ZOOM') {
        // Cú Dolly Zoom điện ảnh: Camera lao vút sâu vào ngực trái của bạn nam
        targetPos.current.set(
          layout.bulletTarget[0],
          layout.bulletTarget[1],
          layout.bulletTarget[2] + (isMobile ? 3.2 : 2.5)
        )
        targetLookAt.current.set(
          layout.bulletTarget[0],
          layout.bulletTarget[1],
          layout.bulletTarget[2]
        )
        camera.position.lerp(targetPos.current, delta * 3.8)
        currentLookAt.current.lerp(targetLookAt.current, delta * 4.2)
      } else {
        // Góc nhìn bao quát phân đoạn ngắm bắn & đạn bay
        const pubgZ = isMobile ? 14.5 : 11.5
        targetPos.current.set(0, 0, pubgZ)
        targetLookAt.current.set(0, 0, 0)

        camera.position.lerp(targetPos.current, delta * 3.0)
        currentLookAt.current.lerp(targetLookAt.current, delta * 3.5)
      }

      camera.lookAt(currentLookAt.current)
    } else if (currentPhase === 'WARP') {
      // Warp speed lao thẳng vào tâm vũ trụ
      warpProgress.current += delta * 0.8
      const p = Math.min(warpProgress.current, 1)
      const easedZ = THREE.MathUtils.lerp(16.0, 4.0, p)
      targetPos.current.set(
        (Math.random() - 0.5) * 0.08,
        (Math.random() - 0.5) * 0.08,
        easedZ
      )
      targetLookAt.current.set(0, 0, 0)

      camera.position.lerp(targetPos.current, delta * 3.5)
      currentLookAt.current.lerp(targetLookAt.current, delta * 4.0)
      camera.lookAt(currentLookAt.current)
    } else if (currentPhase === 'HEART_FIREWORKS') {
      // Camera dừng ở vị trí trực diện để ngắm Trái Tim 3D và Pháo hoa
      const heartZ = isMobile ? 12.5 : 9.5
      targetPos.current.set(0, 0, heartZ)
      targetLookAt.current.set(0, 0, 0)

      camera.position.lerp(targetPos.current, delta * 3.0)
      currentLookAt.current.lerp(targetLookAt.current, delta * 3.5)
      camera.lookAt(currentLookAt.current)
    } else if (currentPhase === 'GALLERY') {
      if (focusedPhotoIndex !== null && photos[focusedPhotoIndex]) {
        isTransitioningToOverview.current = false

        // Camera bay mượt mà đến trước mặt bức ảnh được chọn (cách xa hơn một chút trên mobile để không tràn màn)
        const total = photos.length
        const angle = (focusedPhotoIndex / total) * Math.PI * 2 * 1.4
        const radius = 7.0 + focusedPhotoIndex * 0.35
        const photoX = Math.cos(angle) * radius
        const photoZ = Math.sin(angle) * radius
        const photoY = (focusedPhotoIndex - (total - 1) / 2) * 1.2

        const camDistance = isMobile ? 4.6 : 3.8
        targetPos.current.set(
          photoX + Math.cos(angle) * camDistance,
          photoY,
          photoZ + Math.sin(angle) * camDistance
        )
        targetLookAt.current.set(photoX, photoY, photoZ)

        camera.position.lerp(targetPos.current, delta * 3.5)
        currentLookAt.current.lerp(targetLookAt.current, delta * 4.0)
        camera.lookAt(currentLookAt.current)
      } else if (isTransitioningToOverview.current) {
        // Chỉ nội suy camera cho đến khi gần vị trí overview thì dừng, nhường quyền cho OrbitControls!
        camera.position.lerp(targetPos.current, delta * 3.0)
        currentLookAt.current.lerp(targetLookAt.current, delta * 3.5)
        camera.lookAt(currentLookAt.current)

        if (camera.position.distanceTo(targetPos.current) < 0.5) {
          isTransitioningToOverview.current = false
        }
      }
    }
  })

  return null
}
