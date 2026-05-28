export const PIN_COOKIE = 'wwe-rater-auth'
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 Tage

export function checkPin(input: string): boolean {
  return input === process.env.APP_PIN
}
