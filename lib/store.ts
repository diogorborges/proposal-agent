'use client'

import type { ProposalBrief, MissingField, GeneratedProposal } from './types'

export interface AppState {
  transcript: string
  brief: ProposalBrief | null
  missingFields: MissingField[]
  proposal: GeneratedProposal | null
  apiKey: string | null
}

const STORAGE_KEY = 'proposal-agent-state'

export function saveState(state: Partial<AppState>) {
  if (typeof window === 'undefined') return
  const current = loadState()
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...state }))
}

export function loadState(): AppState {
  if (typeof window === 'undefined') {
    return { transcript: '', brief: null, missingFields: [], proposal: null, apiKey: null }
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { transcript: '', brief: null, missingFields: [], proposal: null, apiKey: null }
    return JSON.parse(raw)
  } catch {
    return { transcript: '', brief: null, missingFields: [], proposal: null, apiKey: null }
  }
}

export function getApiKey(): string | null {
  if (typeof window === 'undefined') return null
  return loadState().apiKey ?? null
}

export function saveApiKey(key: string) {
  saveState({ apiKey: key })
}

export function clearState() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}
