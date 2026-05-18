export const getHistoryEntryKey = (entry) => {
  if (entry?.id) return String(entry.id)

  return [
    entry?.winnerId || entry?.winner_id || entry?.winner || '',
    entry?.loserId || entry?.loser_id || entry?.loser || '',
    entry?.domain || '',
    entry?.timestamp || entry?.created_at || entry?.time || '',
  ].join('|')
}

const isWagerHistoryEntry = (entry) => Boolean(entry?.isWager || entry?.is_wager)

const isTeamLossEntry = (entry, team) => {
  const loserId = entry?.loserId || entry?.loser_id || null
  const loserName = entry?.loser || entry?.loserName || null

  return Boolean(
    (team?.id && loserId === team.id) ||
    (team?.name && loserName === team.name),
  )
}

export const getNewStandardLossEntries = ({
  matchHistory = [],
  knownHistoryKeys = new Set(),
  myTeam,
  phase,
}) => {
  if (!myTeam || phase === 'phase2') return []

  return (matchHistory || []).filter((entry) => (
    !knownHistoryKeys.has(getHistoryEntryKey(entry)) &&
    isTeamLossEntry(entry, myTeam) &&
    !isWagerHistoryEntry(entry)
  ))
}
