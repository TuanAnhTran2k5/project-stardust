import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, Sparkles, KeyRound, ArrowRight, ShieldCheck } from 'lucide-react'
import { APP_CONFIG } from '@/constants/appConfig'
import { useExperienceStore } from '@/store/useExperienceStore'
import { soundEngine } from '@/utils/soundEffects'
import confetti from 'canvas-confetti'

export const LoginCard: React.FC = () => {
  const [passcode, setPasscode] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const startTransition = useExperienceStore((state) => state.startTransition)

  const handleStart = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    soundEngine.playClick()

    // Kiểm tra mật khẩu bí mật (Nếu có cấu hình thì so sánh, không phân biệt hoa thường)
    const expectedPass = APP_CONFIG.passcode
    const inputPass = passcode.trim().toLowerCase()

    if (expectedPass && inputPass && inputPass !== expectedPass) {
      setErrorMsg('Mã bí mật chưa chính xác, thử lại nhé bạn nhỏ 💕')
      soundEngine.playClick()
      return
    }

    // Bắn pháo hoa tim mini mừng đăng nhập
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.65 },
      colors: ['#ffb6c1', '#ffd1dc', '#e6e6fa', '#fff0f5'],
    })

    startTransition()
  }

  const handleQuickFill = () => {
    soundEngine.playClick()
    setPasscode(APP_CONFIG.passcode)
    setErrorMsg('')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85, filter: 'blur(16px)', y: -40 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="relative z-20 w-full max-w-md mx-4"
    >
      <div className="glass-card-pastel rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden backdrop-blur-2xl">
        {/* Glow ambient background inside card */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-pink-300/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-300/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header Icon */}
        <div className="flex flex-col items-center text-center">
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-400/30 to-purple-400/30 border border-pink-200/40 flex items-center justify-center shadow-lg mb-4"
          >
            <Heart className="w-8 h-8 text-pink-300 fill-pink-400/40" />
          </motion.div>

          <span className="text-xs tracking-widest uppercase font-semibold text-pink-200/80 mb-1">
            Galaxy Of Memories
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-pink-200 via-rose-100 to-purple-200 bg-clip-text text-transparent">
            {APP_CONFIG.coupleName}
          </h1>

          <div className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-pink-500/15 border border-pink-300/30 text-pink-200 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-pink-300" />
            <span>{APP_CONFIG.loveStatus}</span>
          </div>

          <p className="mt-3 text-xs sm:text-sm text-pink-100/70 max-w-xs leading-relaxed">
            {APP_CONFIG.welcomeMessage}
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleStart} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs text-pink-200/90 font-medium flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-pink-300" />
                Mật khẩu bí mật
              </span>
              <button
                type="button"
                onClick={handleQuickFill}
                className="text-[11px] text-pink-300/80 hover:text-pink-100 underline decoration-dotted transition-colors"
              >
                Gợi ý: "{APP_CONFIG.passcode}"
              </button>
            </label>

            <div className="relative">
              <input
                type="text"
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value)
                  setErrorMsg('')
                }}
                placeholder={`Nhập "${APP_CONFIG.passcode}" để mở khoá...`}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-pink-200/40 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300/50 focus:border-pink-300/60 transition-all backdrop-blur-md"
              />
              {passcode.trim().toLowerCase() === APP_CONFIG.passcode && (
                <ShieldCheck className="w-5 h-5 text-emerald-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              )}
            </div>

            {errorMsg && (
              <p className="text-xs text-rose-300 text-center animate-bounce mt-1">
                {errorMsg}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="glow-btn w-full py-3.5 px-6 rounded-xl font-semibold text-gray-900 flex items-center justify-center gap-2 cursor-pointer text-sm shadow-xl group"
          >
            <span>Khởi hành vào Vũ trụ Tình yêu</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </form>

        {/* Small footer note */}
        <div className="mt-6 text-center">
          <p className="text-[11px] text-pink-200/50">
            Dành tặng riêng cho tình yêu của chúng mình ✨
          </p>
        </div>
      </div>
    </motion.div>
  )
}
