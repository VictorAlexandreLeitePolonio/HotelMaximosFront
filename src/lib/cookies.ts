const DEFAULT_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24

function isBrowser(): boolean {
  return typeof document !== 'undefined'
}

export function getCookie(name: string): string | null {
  if (!isBrowser()) {
    return null
  }

  const prefix = `${encodeURIComponent(name)}=`
  const match = document.cookie
    .split(';')
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(prefix))

  return match ? decodeURIComponent(match.slice(prefix.length)) : null
}

export function setCookie(
  name: string,
  value: string,
  maxAgeSeconds: number = DEFAULT_COOKIE_MAX_AGE_SECONDS,
) {
  if (!isBrowser()) {
    return
  }

  document.cookie = [
    `${encodeURIComponent(name)}=${encodeURIComponent(value)}`,
    'Path=/',
    'SameSite=Lax',
    `Max-Age=${maxAgeSeconds}`,
  ].join('; ')
}

export function deleteCookie(name: string) {
  if (!isBrowser()) {
    return
  }

  document.cookie = [
    `${encodeURIComponent(name)}=`,
    'Path=/',
    'SameSite=Lax',
    'Max-Age=0',
  ].join('; ')
}
