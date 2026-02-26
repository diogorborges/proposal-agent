'use client'

import { useState, useEffect } from 'react'
import { Key, Eye, EyeOff, ArrowRight, AlertCircle, Trash2, Loader2 } from 'lucide-react'
import { getApiKey, saveApiKey, saveState } from '@/lib/store'

interface ApiKeyGateProps {
  children: React.ReactNode
}

export default function ApiKeyGate({ children }: ApiKeyGateProps) {
  const [status, setStatus] = useState<'loading' | 'needs-key' | 'ready'>('loading')
  const [key, setKey] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showBadge, setShowBadge] = useState(false)

  useEffect(() => {
    const saved = getApiKey()
    setStatus(saved ? 'ready' : 'needs-key')
  }, [])

  const handleSave = () => {
    const trimmed = key.trim()
    if (trimmed.length < 10) {
      setError('Key too short. Get yours at console.anthropic.com')
      return
    }
    saveApiKey(trimmed)
    setStatus('ready')
  }

  const handleClear = () => {
    saveState({ apiKey: null })
    setStatus('needs-key')
    setKey('')
    setShowBadge(false)
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F1117]">
        <Loader2 size={24} className="text-gray-600 animate-spin" />
      </div>
    )
  }

  if (status === 'needs-key') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-[#0F1117]">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
              <Key size={18} color="white" />
            </div>
            <div>
              <h1 className="text-white font-semibold text-lg">Proposal Agent</h1>
              <p className="text-gray-500 text-xs">Powered by Claude</p>
            </div>
          </div>

          <div className="bg-[#12151f] border border-[#2d3148] rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-1">Enter your Anthropic API Key</h2>
            <p className="text-gray-500 text-sm mb-5">
              Stored locally in your browser only — never sent anywhere except Anthropic directly.{' '}
              <a
                href="https://console.anthropic.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline underline-offset-2"
              >
                Get one here →
              </a>
            </p>

            <div className="relative mb-3">
              <input
                type={show ? 'text' : 'password'}
                value={key}
                onChange={(e) => { setKey(e.target.value); setError(null) }}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                placeholder="sk-ant-api03-..."
                className="w-full bg-[#0F1117] border border-[#2d3148] rounded-xl px-4 py-3 pr-12 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20 transition-all font-mono"
              />
              <button
                onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              >
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {error && (
              <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-3">
                <AlertCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-red-300">{error}</p>
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={key.trim().length < 10}
              className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-400 disabled:bg-[#1e2130] disabled:text-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all text-sm"
            >
              Continue
              <ArrowRight size={16} />
            </button>
          </div>

          <p className="text-center text-xs text-gray-700 mt-4">
            Key is only stored in your browser&apos;s localStorage.
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      {children}
      <div className="fixed bottom-4 right-4 z-50">
        {showBadge ? (
          <div className="flex items-center gap-2 bg-[#12151f] border border-[#2d3148] rounded-xl px-3 py-2 shadow-xl">
            <Key size={12} className="text-green-400" />
            <span className="text-xs text-gray-400">API key active</span>
            <button
              onClick={handleClear}
              className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors ml-1"
            >
              <Trash2 size={11} />
              Clear
            </button>
            <button onClick={() => setShowBadge(false)} className="text-gray-600 hover:text-gray-400 ml-1 text-xs">
              ✕
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowBadge(true)}
            className="w-8 h-8 bg-[#12151f] border border-[#2d3148] rounded-full flex items-center justify-center hover:border-gray-500 transition-colors"
            title="API key settings"
          >
            <Key size={13} className="text-green-400" />
          </button>
        )}
      </div>
    </>
  )
}
