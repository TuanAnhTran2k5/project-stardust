import { useTexture } from '@react-three/drei'

export const CHARACTER_ASSETS = {
  femaleSniper: '/images/characters/female_sniper.png',
  maleReceiver: '/images/characters/male_receiver.png',
  femaleAvatar: '/images/characters/female_avatar.png',
} as const

/**
 * Preload toàn bộ assets nhân vật vào GPU memory ngay từ đầu
 * giúp cinematic transition phát mượt mà tức thì 60fps, không delay
 */
export function preloadCharacterAssets() {
  useTexture.preload(CHARACTER_ASSETS.femaleSniper)
  useTexture.preload(CHARACTER_ASSETS.maleReceiver)
  useTexture.preload(CHARACTER_ASSETS.femaleAvatar)
}

export interface CharacterLayoutConfig {
  femalePosition: [number, number, number]
  malePosition: [number, number, number]
  femaleScale: [number, number, number]
  maleScale: [number, number, number]
  femaleRotation: [number, number, number]
  maleRotation: [number, number, number]
  bulletStart: [number, number, number]
  bulletTarget: [number, number, number]
  cameraZ: number
  cameraFov: number
}

/**
 * Tính toán layout Responsive chuẩn xác dựa trên tỉ lệ màn hình
 * Desktop (Landscape 16:9): Đấu súng ngang (Female bên trái, Male bên phải)
 * Mobile (Portrait 9:16): Đấu súng dọc (Female trên, Male dưới, không bị che khuất viền)
 */
export function getResponsiveTransitionLayout(isMobile: boolean): CharacterLayoutConfig {
  if (isMobile) {
    return {
      // Mobile dọc (Portrait 9:16): Nữ ngắm từ trên cao xuống bạn nam ở dưới
      femalePosition: [0, 3.2, 1.0],
      malePosition: [0, -2.7, 1.0],
      femaleScale: [3.8, 5.0, 1],
      maleScale: [3.8, 5.0, 1],
      femaleRotation: [0, 0, -0.06],
      maleRotation: [0, 0, 0.04],
      // Đạn bay từ nòng súng nữ trên cao xuống tim bạn nam ở dưới (vị trí trái tim phát sáng trên áo)
      bulletStart: [0.7, 2.5, 1.2],
      bulletTarget: [0.67, -3.72, 1.2],
      cameraZ: 14.5,
      cameraFov: 52,
    }
  }

  // Desktop ngang (Landscape 16:9): Nữ bên trái, Nam bên phải, tỷ lệ vàng
  return {
    femalePosition: [-3.5, 0.1, 1.0],
    malePosition: [3.5, -0.1, 1.0],
    femaleScale: [4.8, 6.4, 1],
    maleScale: [4.8, 6.4, 1],
    femaleRotation: [0, 0.12, 0],
    maleRotation: [0, -0.12, 0],
    // Đạn bay từ đầu nòng súng ngắm AWM cắm chuẩn xác vào hình trái tim phát sáng trên ngực trái bạn nam
    bulletStart: [-1.7, 0.28, 1.2],
    bulletTarget: [4.35, -1.35, 1.2],
    cameraZ: 11.5,
    cameraFov: 48,
  }
}
