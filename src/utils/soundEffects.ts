/**
 * Hệ thống âm thanh tương tác (Sound Synthesis Engine)
 * Sử dụng Web Audio API độc lập, không phụ thuộc vào tải file mp3 bên ngoài,
 * đảm bảo 100% hoạt động mượt mà, không gặp lỗi CORS hay 404 network.
 */

class SoundEngine {
  private ctx: AudioContext | null = null
  private isMuted: boolean = false
  private bgmGainNode: GainNode | null = null
  private bgmTimer: number | null = null
  private isBgmPlaying: boolean = false

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      this.ctx = new AudioContextClass()
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted
    if (this.bgmGainNode && this.ctx) {
      this.bgmGainNode.gain.setValueAtTime(muted ? 0 : 0.25, this.ctx.currentTime)
    }
  }

  /**
   * Âm thanh nhịp đập trái tim tình yêu (Warm Heartbeat thumps)
   */
  public playHeartbeat() {
    if (this.isMuted) return
    try {
      this.initContext()
      if (!this.ctx) return
      const now = this.ctx.currentTime

      // 2 nhịp đập: "thump - thump"
      ;[0, 0.22].forEach((offset) => {
        if (!this.ctx) return
        const osc = this.ctx.createOscillator()
        const gain = this.ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(65, now + offset)
        osc.frequency.exponentialRampToValueAtTime(35, now + offset + 0.16)

        gain.gain.setValueAtTime(0.3, now + offset)
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.18)

        osc.connect(gain)
        gain.connect(this.ctx.destination)

        osc.start(now + offset)
        osc.stop(now + offset + 0.2)
      })
    } catch {
      // Fallback
    }
  }

  /**
   * Âm thanh pháo hoa bung tỏa lung linh (Starlight Fireworks Burst)
   */
  public playFireworks() {
    if (this.isMuted) return
    try {
      this.initContext()
      if (!this.ctx) return
      const now = this.ctx.currentTime

      // Sparkle shower chimes
      const burstNotes = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98]
      burstNotes.forEach((freq, idx) => {
        if (!this.ctx) return
        const osc = this.ctx.createOscillator()
        const gain = this.ctx.createGain()
        osc.type = 'triangle'
        const start = now + idx * 0.03
        osc.frequency.setValueAtTime(freq, start)
        osc.frequency.exponentialRampToValueAtTime(freq * 1.5, start + 0.45)

        gain.gain.setValueAtTime(0.12, start)
        gain.gain.exponentialRampToValueAtTime(0.0005, start + 0.5)

        osc.connect(gain)
        gain.connect(this.ctx.destination)

        osc.start(start)
        osc.stop(start + 0.52)
      })
    } catch {
      // Fallback
    }
  }

  /**
   * Âm thanh click nhẹ nhàng (Cute bubble pop)
   */
  public playClick() {
    if (this.isMuted) return
    try {
      this.initContext()
      if (!this.ctx) return
      const now = this.ctx.currentTime

      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(520, now)
      osc.frequency.exponentialRampToValueAtTime(780, now + 0.08)

      gain.gain.setValueAtTime(0.15, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08)

      osc.connect(gain)
      gain.connect(this.ctx.destination)

      osc.start(now)
      osc.stop(now + 0.09)
    } catch {
      // Audio context might be restricted before first gesture
    }
  }

  /**
   * Âm thanh chuông gió / hạt sao lấp lánh (Sparkle Chime)
   */
  public playSparkle() {
    if (this.isMuted) return
    try {
      this.initContext()
      if (!this.ctx) return
      const now = this.ctx.currentTime
      const notes = [1046.5, 1318.51, 1567.98, 2093.0] // C6, E6, G6, C7 (Harmonic major chord)

      notes.forEach((freq, idx) => {
        if (!this.ctx) return
        const osc = this.ctx.createOscillator()
        const gain = this.ctx.createGain()

        osc.type = 'triangle'
        const noteStart = now + idx * 0.04
        osc.frequency.setValueAtTime(freq, noteStart)

        gain.gain.setValueAtTime(0.08, noteStart)
        gain.gain.exponentialRampToValueAtTime(0.0005, noteStart + 0.35)

        osc.connect(gain)
        gain.connect(this.ctx.destination)

        osc.start(noteStart)
        osc.stop(noteStart + 0.36)
      })
    } catch {
      // Fallback silent
    }
  }

  /**
   * Âm thanh Warp Speed vũ trụ (Cosmic Hyperspace Swoosh)
   */
  public playWarp() {
    if (this.isMuted) return
    try {
      this.initContext()
      if (!this.ctx) return
      const now = this.ctx.currentTime

      // 1. Bass drone rising
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(80, now)
      osc.frequency.exponentialRampToValueAtTime(800, now + 1.8)

      // Lowpass filter for smooth sci-fi feel
      const filter = this.ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(200, now)
      filter.frequency.exponentialRampToValueAtTime(3500, now + 1.8)

      gain.gain.setValueAtTime(0.01, now)
      gain.gain.linearRampToValueAtTime(0.2, now + 0.8)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2.2)

      osc.connect(filter)
      filter.connect(gain)
      gain.connect(this.ctx.destination)

      osc.start(now)
      osc.stop(now + 2.3)
    } catch {
      // Fallback
    }
  }

  /**
   * Nhạc nền Ambient du dương, lãng mạn (Romantic Space Music Box)
   */
  public startRomanticBGM() {
    if (this.isBgmPlaying) return
    try {
      this.initContext()
      if (!this.ctx) return
      this.isBgmPlaying = true

      this.bgmGainNode = this.ctx.createGain()
      this.bgmGainNode.gain.setValueAtTime(this.isMuted ? 0 : 0.15, this.ctx.currentTime)
      this.bgmGainNode.connect(this.ctx.destination)

      // Giai điệu hợp âm tình yêu nhẹ nhàng (C maj9 -> Am9 -> F maj7 -> G sus)
      const melodyChords = [
        [261.63, 329.63, 392.0, 493.88], // C, E, G, B
        [220.0, 261.63, 329.63, 440.0],  // A, C, E, A
        [174.61, 220.0, 261.63, 349.23], // F, A, C, F
        [196.0, 246.94, 293.66, 392.0],  // G, B, D, G
      ]

      let chordIdx = 0
      const playNextChord = () => {
        if (!this.isBgmPlaying || !this.ctx || !this.bgmGainNode) return
        const now = this.ctx.currentTime
        const chord = melodyChords[chordIdx % melodyChords.length]
        chordIdx++

        chord.forEach((freq, i) => {
          if (!this.ctx || !this.bgmGainNode) return
          const osc = this.ctx.createOscillator()
          const noteGain = this.ctx.createGain()
          osc.type = 'sine'
          osc.frequency.setValueAtTime(freq * 1.5, now + i * 0.15)

          noteGain.gain.setValueAtTime(0.05, now + i * 0.15)
          noteGain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 2.0)

          osc.connect(noteGain)
          noteGain.connect(this.bgmGainNode)

          osc.start(now + i * 0.15)
          osc.stop(now + i * 0.15 + 2.1)
        })

        // Lặp lại chu kỳ hợp âm mỗi 2.8 giây
        this.bgmTimer = window.setTimeout(playNextChord, 2800)
      }

      playNextChord()
    } catch {
      // Fallback
    }
  }

  /**
   * Âm thanh kéo thoi nạp đạn AWM (PUBG Bolt-Action cocking)
   */
  public playBoltAction() {
    if (this.isMuted) return
    try {
      this.initContext()
      if (!this.ctx) return
      const now = this.ctx.currentTime

      // 1. Clack 1 (kéo chốt lên)
      const osc1 = this.ctx.createOscillator()
      const gain1 = this.ctx.createGain()
      osc1.type = 'triangle'
      osc1.frequency.setValueAtTime(1400, now)
      osc1.frequency.exponentialRampToValueAtTime(600, now + 0.05)
      gain1.gain.setValueAtTime(0.12, now)
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.06)
      osc1.connect(gain1)
      gain1.connect(this.ctx.destination)
      osc1.start(now)
      osc1.stop(now + 0.07)

      // 2. Click 2 (đẩy chốt khóa nòng)
      const osc2 = this.ctx.createOscillator()
      const gain2 = this.ctx.createGain()
      osc2.type = 'sine'
      osc2.frequency.setValueAtTime(1800, now + 0.12)
      osc2.frequency.exponentialRampToValueAtTime(900, now + 0.18)
      gain2.gain.setValueAtTime(0.15, now + 0.12)
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.2)
      osc2.connect(gain2)
      gain2.connect(this.ctx.destination)
      osc2.start(now + 0.12)
      osc2.stop(now + 0.21)
    } catch {
      // Fallback
    }
  }

  /**
   * Âm thanh phát bắn tỉa AWM uy lực (AWM Sniper Gunshot with cosmic echo)
   */
  public playSniperShot() {
    if (this.isMuted) return
    try {
      this.initContext()
      if (!this.ctx) return
      const now = this.ctx.currentTime

      // 1. Heavy bass kick impact (tiếng nổ trầm uy lực)
      const bassOsc = this.ctx.createOscillator()
      const bassGain = this.ctx.createGain()
      bassOsc.type = 'sine'
      bassOsc.frequency.setValueAtTime(180, now)
      bassOsc.frequency.exponentialRampToValueAtTime(28, now + 0.45)
      bassGain.gain.setValueAtTime(0.5, now)
      bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.48)
      bassOsc.connect(bassGain)
      bassGain.connect(this.ctx.destination)
      bassOsc.start(now)
      bassOsc.stop(now + 0.5)

      // 2. Supersonic crack / muzzle flash transient (tiếng xé nòng)
      const bufferSize = this.ctx.sampleRate * 0.12
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
      const output = noiseBuffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1
      }
      const noiseSource = this.ctx.createBufferSource()
      noiseSource.buffer = noiseBuffer

      const noiseFilter = this.ctx.createBiquadFilter()
      noiseFilter.type = 'bandpass'
      noiseFilter.frequency.setValueAtTime(2400, now)
      noiseFilter.frequency.exponentialRampToValueAtTime(600, now + 0.12)
      noiseFilter.Q.setValueAtTime(2.5, now)

      const noiseGain = this.ctx.createGain()
      noiseGain.gain.setValueAtTime(0.35, now)
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14)

      noiseSource.connect(noiseFilter)
      noiseFilter.connect(noiseGain)
      noiseGain.connect(this.ctx.destination)
      noiseSource.start(now)
      noiseSource.stop(now + 0.15)

      // 3. Cosmic reverb ring (tiếng vọng không gian du dương)
      const ringOsc = this.ctx.createOscillator()
      const ringGain = this.ctx.createGain()
      ringOsc.type = 'sine'
      ringOsc.frequency.setValueAtTime(880, now + 0.05)
      ringOsc.frequency.exponentialRampToValueAtTime(440, now + 0.8)
      ringGain.gain.setValueAtTime(0.1, now + 0.05)
      ringGain.gain.exponentialRampToValueAtTime(0.0005, now + 0.85)
      ringOsc.connect(ringGain)
      ringGain.connect(this.ctx.destination)
      ringOsc.start(now + 0.05)
      ringOsc.stop(now + 0.9)
    } catch {
      // Fallback
    }
  }

  /**
   * Âm thanh viên đạn trái tim xé gió không gian (Heart Bullet Whistle)
   */
  public playBulletFly() {
    if (this.isMuted) return
    try {
      this.initContext()
      if (!this.ctx) return
      const now = this.ctx.currentTime

      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      osc.type = 'triangle'
      // Doppler effect frequency glide
      osc.frequency.setValueAtTime(800, now)
      osc.frequency.exponentialRampToValueAtTime(1600, now + 0.4)
      osc.frequency.exponentialRampToValueAtTime(520, now + 0.9)

      gain.gain.setValueAtTime(0.02, now)
      gain.gain.linearRampToValueAtTime(0.18, now + 0.35)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.95)

      osc.connect(gain)
      gain.connect(this.ctx.destination)
      osc.start(now)
      osc.stop(now + 1.0)
    } catch {
      // Fallback
    }
  }

  /**
   * Âm thanh viên đạn trúng ngực trái & kích hoạt hồi sinh trái tim (Heart Impact Thud)
   */
  public playHeartImpact() {
    if (this.isMuted) return
    try {
      this.initContext()
      if (!this.ctx) return
      const now = this.ctx.currentTime

      // 1. Sub-bass resonance thump (tiếng tim rung động)
      const subOsc = this.ctx.createOscillator()
      const subGain = this.ctx.createGain()
      subOsc.type = 'sine'
      subOsc.frequency.setValueAtTime(110, now)
      subOsc.frequency.exponentialRampToValueAtTime(30, now + 0.6)
      subGain.gain.setValueAtTime(0.45, now)
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.65)
      subOsc.connect(subGain)
      subGain.connect(this.ctx.destination)
      subOsc.start(now)
      subOsc.stop(now + 0.7)

      // 2. Love crystallization twinkle (tiếng tinh thể kết tinh lấp lánh)
      const chimes = [784.0, 987.77, 1174.66, 1568.0] // G5, B5, D6, G6
      chimes.forEach((freq, idx) => {
        if (!this.ctx) return
        const chimeOsc = this.ctx.createOscillator()
        const chimeGain = this.ctx.createGain()
        chimeOsc.type = 'sine'
        const cStart = now + 0.1 + idx * 0.05
        chimeOsc.frequency.setValueAtTime(freq, cStart)
        chimeGain.gain.setValueAtTime(0.1, cStart)
        chimeGain.gain.exponentialRampToValueAtTime(0.0005, cStart + 0.6)
        chimeOsc.connect(chimeGain)
        chimeGain.connect(this.ctx.destination)
        chimeOsc.start(cStart)
        chimeOsc.stop(cStart + 0.65)
      })
    } catch {
      // Fallback
    }
  }

  public stopRomanticBGM() {
    this.isBgmPlaying = false
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer)
      this.bgmTimer = null
    }
  }
}

export const soundEngine = new SoundEngine()
