import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'

const CONFIG_PATH = new URL('../supabase/config.toml', import.meta.url)

const getFunctionConfig = (configText, functionName) => {
  const sectionPattern = new RegExp(
    `^\\[functions\\.${functionName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\]\\s*$`,
    'm'
  )
  const sectionMatch = sectionPattern.exec(configText)
  if (!sectionMatch) return null

  const sectionStart = sectionMatch.index + sectionMatch[0].length
  const nextSection = configText.slice(sectionStart).search(/^\[/m)
  const sectionBody = nextSection === -1
    ? configText.slice(sectionStart)
    : configText.slice(sectionStart, sectionStart + nextSection)

  return Object.fromEntries(
    sectionBody
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#') && line.includes('='))
      .map((line) => {
        const [key, ...valueParts] = line.split('=')
        return [key.trim(), valueParts.join('=').trim()]
      })
  )
}

test('public edge functions disable Supabase gateway JWT verification', () => {
  assert.equal(fs.existsSync(CONFIG_PATH), true)

  const configText = fs.readFileSync(CONFIG_PATH, 'utf8')

  for (const functionName of ['game-actions', 'public-state']) {
    const functionConfig = getFunctionConfig(configText, functionName)

    assert.ok(functionConfig, `Missing config for ${functionName}`)
    assert.equal(functionConfig.verify_jwt, 'false')
  }
})
