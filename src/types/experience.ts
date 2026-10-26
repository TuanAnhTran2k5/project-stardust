export type AppPhase = 'LOGIN' | 'PUBG_TRANSITION' | 'WARP' | 'HEART_FIREWORKS' | 'GALLERY'
export type PubgSubPhase = 'AIMING' | 'BULLET_FLIGHT' | 'CHEST_ZOOM'

export interface IExperienceState {
  currentPhase: AppPhase
  pubgSubPhase: PubgSubPhase
  isTransitioning: boolean
  isAudioMuted: boolean
  isAudioPlaying: boolean
  setPhase: (phase: AppPhase) => void
  setPubgSubPhase: (subPhase: PubgSubPhase) => void
  startTransition: () => void
  triggerHeartFireworks: () => void
  completeTransition: () => void
  toggleAudio: () => void
  setAudioPlaying: (playing: boolean) => void
}
