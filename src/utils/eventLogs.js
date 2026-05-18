export const formatMatchOutcomeLog = (entry = {}) => {
  const winner = entry.winnerName || entry.winner || 'Unknown'
  const loser = entry.loserName || entry.loser || 'Unknown'
  const domain = entry.domain || 'Unknown'
  return `${winner} defeated ${loser} in ${domain} domain`
}

const getHistoryWinnerId = (entry) => entry?.winnerId || entry?.winner_id || null
const getHistoryLoserId = (entry) => entry?.loserId || entry?.loser_id || null
const getHistoryWinnerName = (entry) => entry?.winnerName || entry?.winner || 'Unknown'
const getHistoryLoserName = (entry) => entry?.loserName || entry?.loser || 'Unknown'

const getHistoryTime = (entry) => entry?.time || entry?.timestamp || entry?.created_at || ''

const matchesTeam = (entry, teamId, teamName) => {
  if (!entry) return false
  const winnerId = getHistoryWinnerId(entry)
  const loserId = getHistoryLoserId(entry)
  if (teamId && (winnerId === teamId || loserId === teamId)) return true
  if (teamName && (getHistoryWinnerName(entry) === teamName || getHistoryLoserName(entry) === teamName)) return true
  return false
}

export const formatPlayerMatchOutcomeLog = (entry = {}, teamId = null, teamName = null) => {
  const winnerId = getHistoryWinnerId(entry)
  const loserId = getHistoryLoserId(entry)
  const winner = getHistoryWinnerName(entry)
  const loser = getHistoryLoserName(entry)
  const domain = entry.domain || 'Unknown'
  const playerWon = (teamId && winnerId === teamId) || (teamName && winner === teamName)
  const playerLost = (teamId && loserId === teamId) || (teamName && loser === teamName)

  if (playerWon) return `You defeated ${loser} in domain ${domain}`
  if (playerLost) return `You were defeated by ${winner} in domain ${domain}`
  return formatMatchOutcomeLog(entry)
}

export const buildTelemetryLogs = ({ matchHistory = [], teamId = null, teamName = null } = {}) => {
  const hasPlayerScope = Boolean(teamId || teamName)
  const scopedHistory = teamId || teamName
    ? matchHistory.filter((entry) => matchesTeam(entry, teamId, teamName))
    : matchHistory

  return [...scopedHistory].reverse().map((entry, index) => ({
    id: entry.id || `telemetry-${index}`,
    time: getHistoryTime(entry),
    message: hasPlayerScope
      ? formatPlayerMatchOutcomeLog(entry, teamId, teamName)
      : formatMatchOutcomeLog(entry),
    raw: entry,
  }))
}

export const buildIntelFeedLogs = (notifications = []) => (
  [...(notifications || [])].reverse().map((entry, index) => ({
    id: entry.id || `intel-${index}`,
    time: entry.time || entry.timestamp || entry.created_at || '',
    message: entry.message || '',
    raw: entry,
  }))
)
