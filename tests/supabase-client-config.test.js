import assert from 'node:assert/strict'
import test from 'node:test'

import { resolveSupabaseKey } from '../src/lib/supabaseConfig.js'

test('Vite Supabase client prefers the legacy anon JWT over publishable keys', () => {
  const anonKey = 'jwt-anon-key'
  const publishableKey = 'sb_publishable_key'

  assert.equal(
    resolveSupabaseKey({
      VITE_SUPABASE_ANON_KEY: anonKey,
      VITE_SUPABASE_PUBLISHABLE_KEY: publishableKey,
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: publishableKey,
    }),
    anonKey
  )
})

test('Vite Supabase client falls back to publishable key when anon JWT is absent', () => {
  const publishableKey = 'sb_publishable_key'

  assert.equal(
    resolveSupabaseKey({
      VITE_SUPABASE_PUBLISHABLE_KEY: publishableKey,
    }),
    publishableKey
  )
})
