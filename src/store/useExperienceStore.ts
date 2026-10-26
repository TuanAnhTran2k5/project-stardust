import { create } from 'zustand'
import type { IExperienceState, AppPhase } from '@/types/experience'
import { soundEngine } from '@/utils/soundEffects'
import { audioManager } from '@/utils/audioManager'

export const useExperienceStore = create<IExperienceState>((set) => ({
  currentPhase: 'LOGIN',
  pubgSubPhase: 'AIMING',
  isTransitioning: false,
  isAudioMuted: false,
  isAudioPlaying: false,

  setPhase: (phase: AppPhase) => {
    // Khi quay trở lại màn hình LOGIN: Tắt nhạc và tua về từ đầu
    if (phase === 'LOGIN') {
      audioManager.stopBGM()
      set({
        currentPhase: 'LOGIN',
        isAudioPlaying: false,
        isTransitioning: false,
      })
    } else {
      set({ currentPhase: phase })
    }
  },
  setPubgSubPhase: (subPhase) => set({ pubgSubPhase: subPhase }),

  startTransition: () => {
    // Kích hoạt phát lại nhạc nền từ đầu (00:00) với hiệu ứng Fade-in 2.0s
    audioManager.playBGM(2000, true)
    set({
      currentPhase: 'PUBG_TRANSITION',
      pubgSubPhase: 'AIMING',
      isTransitioning: true,
      isAudioPlaying: true,
    })
  },

  triggerHeartFireworks: () => {
    soundEngine.playHeartbeat()
    set({
      currentPhase: 'HEART_FIREWORKS',
      isTransitioning: true,
    })
  },

  completeTransition: () => {
    set({
      currentPhase: 'GALLERY',
      isTransitioning: false,
    })
  },

  toggleAudio: () => {
    const nextMuted = audioManager.toggleMute()
    set({ isAudioMuted: nextMuted })
  },

  setAudioPlaying: (playing: boolean) => {
    if (playing) {
      audioManager.playBGM(1500)
    } else {
      audioManager.pauseBGM(800)
    }
    set({ isAudioPlaying: playing })
  },
}))
