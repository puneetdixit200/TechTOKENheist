const DEAD_EVEN_STATUS = {
  cardClass: 'gap-even',
  header: 'DEAD EVEN',
  title: 'DEAD EVEN',
  description: 'The next round decides fate.',
}

export const buildFinaleScoreStatus = ({
  winsA = 0,
  winsB = 0,
  teamAName = 'Team A',
  teamBName = 'Team B',
  isFinalist = false,
  userTeamName = '',
}) => {
  const resolvedWinsA = winsA || 0
  const resolvedWinsB = winsB || 0
  const diff = resolvedWinsA - resolvedWinsB
  const isMatchPoint = Math.max(resolvedWinsA, resolvedWinsB) >= 2

  if (diff === 0 || isMatchPoint) {
    return DEAD_EVEN_STATUS
  }

  const userIsTeamA = userTeamName === teamAName
  const userIsTeamB = userTeamName === teamBName
  const hasFinalistPerspective = isFinalist && (userIsTeamA || userIsTeamB)
  const gap = hasFinalistPerspective ? (userIsTeamA ? diff : -diff) : Math.abs(diff)
  const leadingTeam = hasFinalistPerspective ? userTeamName : (diff >= 0 ? teamAName : teamBName)

  if (gap >= 3) {
    return {
      cardClass: 'gap-domination',
      header: `+${gap} ${leadingTeam} LEADS`,
      title: 'TOTAL DOMINATION',
      description: 'They are crushing the battlefield.',
    }
  }

  if (gap === 2) {
    return {
      cardClass: 'gap-control',
      header: `+${gap} ${leadingTeam} LEADS`,
      title: 'CONTROL ESTABLISHED',
      description: 'Momentum heavily favors them.',
    }
  }

  if (gap === 1) {
    return {
      cardClass: 'gap-narrow',
      header: `+${gap} ${leadingTeam} LEADS`,
      title: 'NARROW ADVANTAGE',
      description: 'One mistake changes everything.',
    }
  }

  if (gap === -1) {
    return {
      cardClass: 'gap-pressure',
      header: `-${Math.abs(gap)} BEHIND`,
      title: 'UNDER PRESSURE',
      description: 'They are one round away from collapse.',
    }
  }

  return {
    cardClass: 'gap-deficit',
    header: `-${Math.abs(gap)} BEHIND`,
    title: 'CRITICAL DEFICIT',
    description: 'Only a miracle comeback remains.',
  }
}
