import React, { useMemo } from 'react'
import { useGalleryStore } from '@/store/useGalleryStore'
import { PhotoFrame3D } from '@/components/3d/gallery/PhotoFrame3D'

export const FloatingGallery: React.FC = () => {
  const photos = useGalleryStore((state) => state.photos)

  // Tính toán tọa độ phân bổ hình xoắn ốc dải ngân hà (Galaxy Helix Spiral)
  const photoLayouts = useMemo(() => {
    const total = photos.length
    return photos.map((photo, index) => {
      // 1.5 vòng xoắn ốc
      const angle = (index / total) * Math.PI * 2 * 1.4
      const radius = 7.0 + index * 0.35
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius
      const y = (index - (total - 1) / 2) * 1.2

      // Xoay mặt khung ảnh hướng nhẹ về phía tâm
      const rotY = -angle + Math.PI / 2
      const rotX = 0.05 * Math.sin(index)

      return {
        photo,
        index,
        position: [x, y, z] as [number, number, number],
        rotation: [rotX, rotY, 0] as [number, number, number],
      }
    })
  }, [photos])

  return (
    <group>
      {photoLayouts.map((item) => (
        <PhotoFrame3D
          key={item.photo.id}
          photo={item.photo}
          index={item.index}
          position={item.position}
          rotation={item.rotation}
        />
      ))}
    </group>
  )
}
