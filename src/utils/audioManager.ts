/**
 * Dual-Channel Audio Architecture Manager
 * - Kênh 1 (BGM Channel): Phát lặp bản nhạc nền "Số 1 Thế Giới" (/audio/so-1-the-gioi.mp3),
 *   hỗ trợ Fade-in/Fade-out mượt mà, âm lượng nền lý tưởng ~0.35.
 * - Kênh 2 (SFX Channel): Điều phối toàn bộ âm thanh hiệu ứng (bắn súng, tim đập, pháo hoa, click)
 *   với âm lượng ~0.75, hoạt động song song hoàn toàn độc lập với BGM.
 * - Master Mute: Cho phép bật/tắt toàn bộ âm thanh hệ thống chỉ với 1 click.
 */

import { soundEngine } from '@/utils/soundEffects'

export interface IAudioState {
  isMuted: boolean
  isBgmPlaying: boolean
  bgmVolume: number
  sfxVolume: number
}

type AudioListener = (state: IAudioState) => void

class AudioManager {
  private bgmAudio: HTMLAudioElement | null = null
  private bgmSrc: string = '/audio/so-1-the-gioi.mp3'
  private isMuted: boolean = false
  private isBgmPlaying: boolean = false
  private bgmVolume: number = 0.50 // Âm lượng BGM mặc định 50%
  private sfxVolume: number = 0.78 // Âm lượng SFX rõ ràng
  private fadeInterval: number | null = null
  private listeners: Set<AudioListener> = new Set()

  constructor() {
    // Chỉ khởi tạo trên client (tránh lỗi SSR nếu có)
    if (typeof window !== 'undefined') {
      this.initBgmElement()
    }
  }

  /**
   * Khởi tạo HTMLAudioElement cho BGM Channel
   */
  private initBgmElement() {
    try {
      this.bgmAudio = new Audio(this.bgmSrc)
      this.bgmAudio.loop = true
      this.bgmAudio.preload = 'auto'
      this.bgmAudio.volume = 0 // Bắt đầu ở 0 để chuẩn bị cho fade-in
      
      // Xử lý khi bài hát kết thúc (phòng trường hợp trình duyệt không lặp tự động)
      this.bgmAudio.addEventListener('ended', () => {
        if (this.isBgmPlaying && !this.isMuted) {
          this.bgmAudio?.play().catch(() => {})
        }
      })
    } catch (err) {
      console.warn('[AudioManager] Failed to initialize BGM element:', err)
    }
  }

  /**
   * Phát nhạc nền (BGM) với hiệu ứng Fade-in mượt mà
   * @param fadeDurationMs Thời gian fade-in tính bằng ms
   * @param restartFromStart Nếu true sẽ tua nhạc về 00:00 và phát lại từ đầu
   */
  public async playBGM(fadeDurationMs: number = 1800, restartFromStart: boolean = false): Promise<void> {
    if (!this.bgmAudio) {
      this.initBgmElement()
    }
    if (!this.bgmAudio) return

    if (restartFromStart) {
      this.bgmAudio.currentTime = 0
    }

    this.isBgmPlaying = true
    this.notify()

    if (this.isMuted) {
      this.bgmAudio.volume = 0
      try {
        await this.bgmAudio.play()
      } catch {
        // Chờ tương tác nếu bị Autoplay block
      }
      return
    }

    try {
      // Đặt volume ban đầu về 0 trước khi play để fade-in
      this.bgmAudio.volume = 0
      const playPromise = this.bgmAudio.play()

      if (playPromise !== undefined) {
        await playPromise
        this.fadeIn(fadeDurationMs)
      }
    } catch (err) {
      console.warn('[AudioManager] Autoplay blocked, waiting for user interaction:', err)
      // Tự động kích hoạt khi có cử chỉ chạm / click đầu tiên của người dùng
      const unlockAudio = () => {
        if (this.isBgmPlaying && !this.isMuted && this.bgmAudio) {
          this.bgmAudio.play().then(() => this.fadeIn(fadeDurationMs)).catch(() => {})
        }
        window.removeEventListener('pointerdown', unlockAudio)
        window.removeEventListener('keydown', unlockAudio)
      }
      window.addEventListener('pointerdown', unlockAudio, { once: true })
      window.addEventListener('keydown', unlockAudio, { once: true })
    }
  }

  /**
   * Dừng hẳn nhạc nền và tua lại từ đầu (Khi quay về Login)
   */
  public stopBGM(): void {
    if (this.fadeInterval) {
      clearInterval(this.fadeInterval)
      this.fadeInterval = null
    }
    this.isBgmPlaying = false
    if (this.bgmAudio) {
      this.bgmAudio.pause()
      this.bgmAudio.currentTime = 0 // Tua về 00:00
      this.bgmAudio.volume = 0
    }
    this.notify()
  }

  /**
   * Tạm dừng hoặc dừng hẳn nhạc nền kèm hiệu ứng Fade-out
   */
  public pauseBGM(fadeDurationMs: number = 800): void {
    if (!this.bgmAudio || !this.isBgmPlaying) return

    this.isBgmPlaying = false
    this.notify()

    this.fadeOut(fadeDurationMs, () => {
      this.bgmAudio?.pause()
    })
  }

  /**
   * Hiệu ứng Fade-in âm lượng BGM
   */
  private fadeIn(durationMs: number) {
    if (this.fadeInterval) clearInterval(this.fadeInterval)
    if (!this.bgmAudio) return

    const targetVolume = this.isMuted ? 0 : this.bgmVolume
    const steps = 30
    const stepTime = durationMs / steps
    const stepGain = targetVolume / steps

    this.bgmAudio.volume = 0

    this.fadeInterval = window.setInterval(() => {
      if (!this.bgmAudio) {
        if (this.fadeInterval) clearInterval(this.fadeInterval)
        return
      }

      const nextVol = Math.min(this.bgmAudio.volume + stepGain, targetVolume)
      this.bgmAudio.volume = nextVol

      if (nextVol >= targetVolume) {
        if (this.fadeInterval) clearInterval(this.fadeInterval)
        this.fadeInterval = null
      }
    }, stepTime)
  }

  /**
   * Hiệu ứng Fade-out âm lượng BGM
   */
  private fadeOut(durationMs: number, onComplete?: () => void) {
    if (this.fadeInterval) clearInterval(this.fadeInterval)
    if (!this.bgmAudio) {
      if (onComplete) onComplete()
      return
    }

    const startVolume = this.bgmAudio.volume
    const steps = 25
    const stepTime = durationMs / steps
    const stepGain = startVolume / steps

    this.fadeInterval = window.setInterval(() => {
      if (!this.bgmAudio) {
        if (this.fadeInterval) clearInterval(this.fadeInterval)
        if (onComplete) onComplete()
        return
      }

      const nextVol = Math.max(0, this.bgmAudio.volume - stepGain)
      this.bgmAudio.volume = nextVol

      if (nextVol <= 0.01) {
        this.bgmAudio.volume = 0
        if (this.fadeInterval) clearInterval(this.fadeInterval)
        this.fadeInterval = null
        if (onComplete) onComplete()
      }
    }, stepTime)
  }

  /**
   * Bật/Tắt toàn bộ âm thanh (Master Mute / Unmute)
   */
  public setMuted(muted: boolean): void {
    this.isMuted = muted

    // 1. Đồng bộ kênh SFX synthesizer
    soundEngine.setMuted(muted)

    // 2. Đồng bộ kênh BGM
    if (this.bgmAudio) {
      if (muted) {
        this.bgmAudio.volume = 0
      } else {
        if (this.isBgmPlaying) {
          this.fadeIn(1000)
        }
      }
    }

    this.notify()
  }

  /**
   * Toggle Mute qua lại
   */
  public toggleMute(): boolean {
    const nextMuted = !this.isMuted
    this.setMuted(nextMuted)
    return nextMuted
  }

  /**
   * Điều chỉnh âm lượng BGM (0.0 đến 1.0)
   */
  public setBgmVolume(volume: number): void {
    const clamped = Math.max(0, Math.min(1, volume))
    this.bgmVolume = clamped

    if (clamped === 0) {
      this.isMuted = true
      soundEngine.setMuted(true)
      if (this.bgmAudio) this.bgmAudio.volume = 0
    } else {
      // Khi người dùng kéo tăng âm lượng thì tự động bật âm thanh nếu đang tắt
      if (this.isMuted) {
        this.isMuted = false
        soundEngine.setMuted(false)
      }
      if (this.bgmAudio && this.isBgmPlaying) {
        this.bgmAudio.volume = clamped
      }
    }
    this.notify()
  }

  /**
   * Lấy trạng thái âm thanh hiện tại
   */
  public getState(): IAudioState {
    return {
      isMuted: this.isMuted,
      isBgmPlaying: this.isBgmPlaying,
      bgmVolume: this.bgmVolume,
      sfxVolume: this.sfxVolume,
    }
  }

  /**
   * Đăng ký lắng nghe thay đổi trạng thái âm thanh (Observer pattern cho React Hooks)
   */
  public subscribe(listener: AudioListener): () => void {
    this.listeners.add(listener)
    listener(this.getState())
    return () => {
      this.listeners.delete(listener)
    }
  }

  private notify(): void {
    const state = this.getState()
    this.listeners.forEach((listener) => listener(state))
  }

  /**
   * Giải phóng bộ nhớ khi cần
   */
  public cleanup(): void {
    if (this.fadeInterval) clearInterval(this.fadeInterval)
    if (this.bgmAudio) {
      this.bgmAudio.pause()
      this.bgmAudio.src = ''
      this.bgmAudio = null
    }
    this.listeners.clear()
  }
}

// Singleton Export
export const audioManager = new AudioManager()
