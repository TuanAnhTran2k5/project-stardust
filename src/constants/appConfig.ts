export const APP_CONFIG = {
  coupleName: import.meta.env.VITE_COUPLE_NAME || 'Anh & Em',
  welcomeMessage:
    import.meta.env.VITE_WELCOME_MESSAGE ||
    'Chào mừng em đến với dải ngân hà của chúng mình ✨',
  passcode: (import.meta.env.VITE_PASSCODE || 'love').trim().toLowerCase(),
  loveDate: import.meta.env.VITE_LOVE_DATE || '',
  loveStatus: import.meta.env.VITE_LOVE_STATUS || 'Khởi đầu hành trình bên nhau ✨',
}

/**
 * Tính số ngày bên nhau dựa trên ngày bắt đầu
 */
export function getDaysTogether(startDateStr: string): number {
  try {
    const start = new Date(startDateStr).getTime()
    const now = new Date().getTime()
    const diff = Math.max(0, now - start)
    return Math.floor(diff / (1000 * 60 * 60 * 24))
  } catch {
    return 100
  }
}
