const EMPTY_PUBLIC_STATE_ROWS = {
  systemRows: [],
  teamsRows: [],
  queueRows: [],
  matchRows: [],
  historyRows: [],
  notificationRows: [],
  tokenHistory: [],
}

export const fetchPublicStateRows = async (supabaseClient) => {
  const { data, error } = await supabaseClient.functions.invoke('public-state', {
    body: {},
  })

  if (error) throw error

  return {
    ...EMPTY_PUBLIC_STATE_ROWS,
    ...(data || {}),
  }
}
