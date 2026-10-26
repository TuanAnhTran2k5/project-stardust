import { useState, useEffect, useCallback } from 'react'
import { audioManager, type IAudioState } from '@/utils/audioManager'
import { soundEngine } from '@/utils/soundEffects'

/**
 * Custom Hook kết nối với AudioManager
 * Cung cấp reactive state và các hàm điều khiển âm thanh toàn cục
 */
export function useSoundSystem() {
  const [audioState, setAudioState] = useState<IAudioState>(audioManager.getState())

  useEffect(() => {
    const unsubscribe = audioManager.subscribe((nextState) => {
      setAudioState(nextState)
    })
    return () => {
      unsubscribe()
    }
  }, [])

  const toggleMute = useCallback(() => {
    return audioManager.toggleMute()
  }, [])

  const setMuted = useCallback((muted: boolean) => {
    audioManager.setMuted(muted)
  }, [])

  const playBGM = useCallback((fadeMs?: number) => {
    return audioManager.playBGM(fadeMs)
  }, [])

  const pauseBGM = useCallback((fadeMs?: number) => {
    audioManager.pauseBGM(fadeMs)
  }, [])

  const stopBGM = useCallback(() => {
    audioManager.stopBGM()
  }, [])

  const setBgmVolume = useCallback((volume: number) => {
    audioManager.setBgmVolume(volume)
  }, [])

  return {
    ...audioState,
    toggleMute,
    setMuted,
    setBgmVolume,
    playBGM,
    pauseBGM,
    stopBGM,
    soundEngine, // Cho phép gọi SFX trực tiếp nếu cần
  }
}
