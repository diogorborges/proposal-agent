'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LayoutTemplate, MessageSquare, HelpCircle, Loader2 } from 'lucide-react'
import Logo from '@/components/Logo'
import StepBar from '@/components/StepBar'
import { loadState, saveState, getApiKey } from '@/lib/store'
import type { GeneratedProposal, LibraryReference } from '@/lib/types'

type Phase = 'idle' | 'deck' | 'talktrack' | 'faq' | 'complete' | 'error'

interface ProgressItem {
  id: string
  label: string
  icon: React.ReactNode
  phase: Phase
  statusMessage: string
}

const PHASE_ORDER: Phase[] = ['idle', 'deck', 'talktrack', 'faq', 'complete']

function phaseProgress(current: Phase, target: Phase): number {
  const ci = PHASE_ORDER.indexOf(current)
  const ti = PHASE_ORDER.indexOf(target)
  if (ti < ci) return 100
  if (ti === ci) return 60
  return 0
}

export default function GeneratingScreen() {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('idle')
  const [statusMessage, setStatusMessage] = useState('Searching content library...')
  const [references, setReferences] = useState<LibraryReference[]>([])
  const [error, setError] = useState<string | null>(null)
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true

    const state = loadState()
    if (!state.brief) {
      router.replace('/')
      return
    }

    const run = async () => {
      try {
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': getApiKey() ?? '',
          },
          body: JSON.stringify({ brief: state.brief }),
        })

        if (!res.ok || !res.body) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error || 'Generation failed')
        }

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            try {
              const event = JSON.parse(line.slice(6))
              handleEvent(event)
            } catch {
              // ignore malformed lines
            }
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Generation failed. Please try again.')
        setPhase('error')
      }
    }

    run()
  }, [router])

  const handleEvent = (event: { type: string; data: unknown }) => {
    switch (event.type) {
      case 'references':
        setReferences(event.data as LibraryReference[])
        setPhase('deck')
        setStatusMessage('Building deck outline...')
        break
      case 'status': {
        const s = event.data as { phase: string; message: string }
        if (s.phase === 'deck') { setPhase('deck'); setStatusMessage(s.message) }
        if (s.phase === 'talktrack') { setPhase('talktrack'); setStatusMessage(s.message) }
        if (s.phase === 'faq') { setPhase('faq'); setStatusMessage(s.message) }
        break
      }
      case 'complete': {
        const proposal = event.data as GeneratedProposal
        saveState({ proposal })
        setPhase('complete')
        setStatusMessage('Complete!')
        setTimeout(() => {
          router.push('/review')
        }, 800)
        break
      }
      case 'error': {
        const e = event.data as { message: string }
        setError(e.message)
        setPhase('error')
        break
      }
    }
  }

  const items: ProgressItem[] = [
    {
      id: 'deck',
      label: 'Deck Outline',
      icon: <LayoutTemplate size={18} className="text-blue-400" />,
      phase: 'deck',
      statusMessage:
        phase === 'deck' ? statusMessage : phase === 'idle' ? 'Waiting...' : 'Done',
    },
    {
      id: 'talktrack',
      label: 'Talk Track',
      icon: <MessageSquare size={18} className="text-purple-400" />,
      phase: 'talktrack',
      statusMessage:
        phase === 'talktrack' ? statusMessage : PHASE_ORDER.indexOf(phase) > PHASE_ORDER.indexOf('talktrack') ? 'Done' : 'Waiting...',
    },
    {
      id: 'faq',
      label: 'FAQ',
      icon: <HelpCircle size={18} className="text-green-400" />,
      phase: 'faq',
      statusMessage:
        phase === 'faq' ? statusMessage : PHASE_ORDER.indexOf(phase) > PHASE_ORDER.indexOf('faq') ? 'Done' : 'Waiting...',
    },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b border-[#1e2130]">
        <Logo />
        <span className="text-xs text-gray-500">AI is working...</span>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <StepBar current={3} />

        <div className="w-full max-w-lg mt-4">
          <div className="bg-[#12151f] border border-[#2d3148] rounded-2xl p-8">
            <div className="flex flex-col items-center mb-8">
              {phase === 'error' ? (
                <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center mb-4 border border-red-500/30">
                  <span className="text-2xl">⚠️</span>
                </div>
              ) : (
                <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-4 border border-blue-500/20">
                  <Loader2 size={24} className="text-blue-400 animate-spin" />
                </div>
              )}
              <h1 className="text-xl font-semibold text-white">
                {phase === 'error' ? 'Generation Failed' : 'Generating your proposal...'}
              </h1>
              {phase === 'error' ? (
                <p className="text-sm text-red-400 mt-1 text-center">{error}</p>
              ) : (
                <p className="text-sm text-gray-500 mt-1">{statusMessage}</p>
              )}
            </div>

            {phase !== 'error' && (
              <div className="flex flex-col gap-5">
                {items.map((item) => {
                  const progress = phaseProgress(phase, item.phase as Phase)
                  const isActive = phase === item.phase
                  const isDone = PHASE_ORDER.indexOf(phase) > PHASE_ORDER.indexOf(item.phase as Phase)

                  return (
                    <div key={item.id}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {item.icon}
                          <span className="text-sm font-medium text-white">{item.label}</span>
                          {isActive && (
                            <span className="text-xs text-blue-400 animate-pulse">generating...</span>
                          )}
                          {isDone && (
                            <span className="text-xs text-green-400">done</span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">{progress}%</span>
                      </div>
                      <div className="h-1.5 bg-[#1e2130] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ${
                            isDone ? 'bg-green-500' : 'bg-blue-500'
                          } ${isActive ? 'animate-pulse' : ''}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {references.length > 0 && phase !== 'error' && (
              <div className="mt-6 pt-5 border-t border-[#2d3148]">
                <p className="text-xs text-gray-500 mb-2">Grounded in {references.length} reference proposals:</p>
                <div className="flex flex-wrap gap-2">
                  {references.map((ref) => (
                    <span
                      key={ref.id}
                      className="text-xs bg-[#1e2130] border border-[#2d3148] text-gray-400 rounded-full px-2.5 py-1"
                    >
                      {ref.title.split('—')[0].trim()} · {ref.similarity}%
                    </span>
                  ))}
                </div>
              </div>
            )}

            {phase === 'error' && (
              <button
                onClick={() => router.push('/brief')}
                className="w-full mt-4 bg-blue-500 hover:bg-blue-400 text-white font-semibold py-3 rounded-xl transition-all text-sm"
              >
                Go back and try again
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="text-center pb-4">
        <span className="text-xs text-gray-700">3 / 5</span>
      </div>
    </div>
  )
}
