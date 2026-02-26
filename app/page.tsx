'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, ArrowRight, Loader2, AlertCircle } from 'lucide-react'
import Logo from '@/components/Logo'
import StepBar from '@/components/StepBar'
import { saveState, clearState, getApiKey } from '@/lib/store'

const SAMPLE_TRANSCRIPT = `Sarah Chen (CTO, Meridian Financial): Thanks for joining today. We've been struggling with our data infrastructure for the past two years. Our current setup is basically a collection of legacy systems that don't talk to each other well.

Alex Rivera (Lumenalta): Can you tell me more about what those struggles look like day-to-day?

Sarah Chen: Sure. Our risk reporting takes about 36 hours end-to-end, which means by the time we have the numbers, the market has already moved. We're also under increasing pressure from our regulators — Basel III compliance reporting is becoming a nightmare.

Alex Rivera: Who else is involved in this decision on your side?

Sarah Chen: It's mainly myself, Marcus Webb our VP of Engineering, and we'd need sign-off from our CFO, Patricia Nguyen. She's very focused on ROI and won't move forward unless we can demonstrate clear cost savings within the first year.

Alex Rivera: What does success look like for you in 12 months?

Sarah Chen: Honestly? If we can get reporting down to under 4 hours and pass our next regulatory audit without the scramble we had last time, that would be a massive win. We're also looking to build some real-time fraud detection capability — that's on Marcus's roadmap.

Alex Rivera: Are you evaluating other vendors?

Sarah Chen: We're talking to Accenture and there's an internal IT team that thinks they can build something. But frankly, our IT team is stretched thin and I'm skeptical they have the bandwidth.

Alex Rivera: What's the budget envelope you're working with?

Sarah Chen: We haven't finalized it but we're thinking somewhere in the $3-5M range for the initial phase, with potential to expand if we see results.

Alex Rivera: And timeline — when are you hoping to kick this off?

Sarah Chen: Ideally Q2, so April or May. We have a board presentation in September where we want to show progress.`

export default function UploadScreen() {
  const router = useRouter()
  const [transcript, setTranscript] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async () => {
    if (transcript.trim().length < 50) {
      setError('Please paste a transcript with at least 50 characters.')
      return
    }

    setLoading(true)
    setError(null)

    const apiKey = getApiKey()
    clearState()
    if (apiKey) saveState({ apiKey })

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey ?? '',
        },
        body: JSON.stringify({ transcript }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to analyze transcript')
      }

      saveState({ transcript, brief: data.brief, missingFields: data.missingFields })
      router.push('/brief')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const loadSample = () => {
    setTranscript(SAMPLE_TRANSCRIPT)
    setError(null)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b border-[#1e2130]">
        <Logo />
        <button
          onClick={() => {
            localStorage.clear()
            window.location.reload()
          }}
          className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
        >
          Reset API Key
        </button>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <StepBar current={1} />

        <div className="w-full max-w-2xl mt-4">
          <div className="border border-dashed border-[#2d3148] rounded-2xl p-8 bg-[#12151f]">
            <div className="flex flex-col items-center mb-6">
              <div className="w-14 h-14 bg-[#1a1d2e] rounded-2xl flex items-center justify-center mb-4 border border-[#2d3148]">
                <FileText size={24} className="text-blue-400" />
              </div>
              <h1 className="text-xl font-semibold text-white">Paste your discovery call transcript</h1>
              <p className="text-sm text-gray-500 mt-1">Supports Fellow, Zoom, Teams, Gong — any plain text format</p>
            </div>

            <textarea
              value={transcript}
              onChange={(e) => {
                setTranscript(e.target.value)
                if (error) setError(null)
              }}
              placeholder="Sarah: Hi, we're looking to modernize our data infrastructure. We've been struggling with 36-hour reporting cycles and our compliance team is overwhelmed..."
              className="w-full h-52 bg-[#0F1117] border border-[#2d3148] rounded-xl p-4 text-sm text-gray-200 placeholder-gray-600 resize-none focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20 transition-all"
            />

            <div className="flex items-center justify-between mt-2 mb-4">
              <button
                onClick={loadSample}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors underline underline-offset-2"
              >
                Load sample transcript
              </button>
              <span className="text-xs text-gray-600">{transcript.length} characters</span>
            </div>

            {error && (
              <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-4">
                <AlertCircle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={loading || transcript.trim().length < 50}
              className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-400 disabled:bg-[#1e2130] disabled:text-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-all text-sm"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Analyzing transcript...
                </>
              ) : (
                <>
                  Analyze Call
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>

          <p className="text-center text-xs text-gray-600 mt-4">
            Your transcript is processed securely and never stored permanently.
          </p>
        </div>
      </div>

      <div className="text-center pb-4">
        <span className="text-xs text-gray-700">1 / 5</span>
      </div>
    </div>
  )
}
