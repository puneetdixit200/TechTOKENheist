export const PLAYER_PRESTART_ALLOWED_PATHS = new Set(['/about', '/devs'])

const normalizeRoutePath = (path = '') => {
  if (!path || path === '/') return '/'
  return path.replace(/\.html$/, '')
}

export const isAdminUser = (user) => {
  if (user?.role !== 'admin') return false
  if (user?.token) return true
  if (!user?.adminSessionToken) return false
  return Number(user?.adminSessionExpiresAt) > Date.now()
}

export const isPlayerUser = (user) => user?.role === 'player' && Boolean(user?.teamId)

export const isGameStartedForPlayers = (gameState) => (
  Boolean(gameState?.isGameActive) || gameState?.status === 'active'
)

export function canAccessPlayerPath(path, gameState) {
  if (isGameStartedForPlayers(gameState)) return true
  return PLAYER_PRESTART_ALLOWED_PATHS.has(normalizeRoutePath(path))
}

export function getAuthenticatedHomePath(user, gameState) {
  if (isAdminUser(user)) return '/admin'
  if (isPlayerUser(user)) return isGameStartedForPlayers(gameState) ? '/lobby' : '/about'
  return null
}

export function getRoleRedirectPath(user, gameState) {
  return getAuthenticatedHomePath(user, gameState) || '/login'
}
