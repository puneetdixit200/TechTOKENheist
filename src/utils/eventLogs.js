export const formatMatchOutcomeLog = (entry = {}) => {
  const winner = entry.winnerName || entry.winner || 'Unknown'
  const loser = entry.loserName || entry.loser || 'Unknown'
  const domain = entry.domain || 'Unknown'
  return `${winner} defeated ${loser} in ${domain} domain`
}

const getHistoryWinnerId = (entry) => entry?.winnerId || entry?.winner_id || null
const getHistoryLoserId = (entry) => entry?.loserId || entry?.loser_id || null

const getHistoryTime = (entry) => entry?.time || entry?.timestamp || entry?.created_at || ''

const matchesTeam = (entry, teamId, teamName) => {
  if (!entry) return false
  const winnerId = getHistoryWinnerId(entry)
  const loserId = getHistoryLoserId(entry)
  if (teamId && (winnerId === teamId || loserId === teamId)) return true
  if (teamName && (entry.winner === teamName || entry.loser === teamName)) return true
  return false
}

export const buildTelemetryLogs = ({ matchHistory = [], teamId = null, teamName = null } = {}) => {
  const scopedHistory = teamId || teamName
    ? matchHistory.filter((entry) => matchesTeam(entry, teamId, teamName))
    : matchHistory

  return [...scopedHistory].reverse().map((entry, index) => ({
    id: entry.id || `telemetry-${index}`,
    time: getHistoryTime(entry),
    message: formatMatchOutcomeLog(entry),
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
