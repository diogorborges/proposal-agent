'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Bell,
  ArrowLeft,
  Check,
} from 'lucide-react'
import Logo from '@/components/Logo'
import StepBar from '@/components/StepBar'
import { loadState, saveState } from '@/lib/store'
import type { ProposalBrief, MissingField } from '@/lib/types'
import { REQUIRED_FIELDS } from '@/lib/types'

const FIELD_LABELS: Record<keyof ProposalBrief, string> = {
  client: 'Client Name',
  industry: 'Industry',
  painPoints: 'Pain Points',
  budget: 'Budget Signal',
  timeline: 'Timeline',
  stakeholders: 'Key Stakeholders',
  successCriteria: 'Success Criteria',
  competitiveContext: 'Competitive Context',
}

export default function BriefScreen() {
  const router = useRouter()
  const [brief, setBrief] = useState<ProposalBrief | null>(null)
  const [missingFields, setMissingFields] = useState<MissingField[]>([])
  const [slackSent, setSlackSent] = useState(false)

  useEffect(() => {
    const state = loadState()
    if (!state.brief) {
      router.replace('/')
      return
    }
    setBrief(state.brief)
    setMissingFields(state.missingFields)
  }, [router])

  const handleSlackAlert = () => {
    console.log('[Mock Slack] Alerting seller about missing fields:', missingFields.map((f) => f.label))
    setSlackSent(true)
    setTimeout(() => setSlackSent(false), 3000)
  }

  const handleApprove = () => {
    router.push('/generating')
  }

  const handleBack = () => {
    router.push('/')
  }

  if (!brief) return null

  const presentFields = REQUIRED_FIELDS.filter((f) => brief[f.field])
  const missingFieldKeys = new Set(missingFields.map((f) => f.field))

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b border-[#1e2130]">
        <Logo />
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          <ArrowLeft size={14} />
          Back
        </button>
      </header>

      <div className="flex-1 flex flex-col items-center px-4 py-4 max-w-6xl mx-auto w-full">
        <StepBar current={2} />

        <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">
          {/* Left column — extracted fields */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <h1 className="text-lg font-semibold text-white">Extracted Brief</h1>
              <span className="text-xs bg-[#1e2130] border border-[#2d3148] text-gray-400 rounded-full px-2 py-0.5">
                {presentFields.length}/{REQUIRED_FIELDS.length} fields
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {REQUIRED_FIELDS.map((fieldDef) => {
                const value = brief[fieldDef.field]
                const isMissing = missingFieldKeys.has(fieldDef.field)

                return (
                  <div
                    key={fieldDef.field}
                    className={`rounded-xl p-4 border transition-all ${
                      isMissing
                        ? 'bg-red-500/5 border-red-500/40'
                        : 'bg-[#12151f] border-[#2d3148]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-2">
                      {isMissing ? (
                        <AlertTriangle size={13} className="text-red-400 flex-shrink-0" />
                      ) : (
                        <CheckCircle2 size={13} className="text-green-400 flex-shrink-0" />
                      )}
                      <span
                        className={`text-xs font-semibold uppercase tracking-wider ${
                          isMissing ? 'text-red-400' : 'text-gray-400'
                        }`}
                      >
                        {fieldDef.label}
                      </span>
                    </div>

                    {isMissing ? (
                      <p className="text-sm text-red-300/80">{fieldDef.reason}</p>
                    ) : (
                      <p className="text-sm text-gray-200 leading-relaxed">{value}</p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right column — missing fields panel + approve */}
          <div className="flex flex-col gap-4">
            {missingFields.length > 0 && (
              <div className="bg-[#12151f] border border-[#2d3148] rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle size={15} className="text-amber-400" />
                  <h2 className="text-sm font-semibold text-white">Missing Fields</h2>
                </div>
                <div className="flex flex-col gap-3 mb-4">
                  {missingFields.map((f) => (
                    <div key={f.field} className="flex flex-col gap-0.5">
                      <span className="text-xs font-semibold text-amber-400">{f.label}</span>
                      <span className="text-xs text-gray-500 leading-relaxed">{f.reason}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleSlackAlert}
                  className={`w-full flex items-center justify-center gap-2 text-xs font-semibold py-2.5 rounded-lg border transition-all ${
                    slackSent
                      ? 'bg-green-500/10 border-green-500/30 text-green-400'
                      : 'bg-[#0F1117] border-[#2d3148] text-gray-300 hover:border-gray-500 hover:text-white'
                  }`}
                >
                  {slackSent ? (
                    <>
                      <Check size={14} />
                      Alert sent to seller
                    </>
                  ) : (
                    <>
                      <Bell size={14} />
                      Alert seller via Slack
                    </>
                  )}
                </button>
              </div>
            )}

            <div className="bg-[#12151f] border border-[#2d3148] rounded-xl p-5 flex flex-col gap-3">
              <div>
                <h2 className="text-sm font-semibold text-white mb-1">Checkpoint 1 — Seller Review</h2>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Confirm the brief is accurate before generation begins. You can proceed even with missing fields.
                </p>
              </div>

              {missingFields.length > 0 && (
                <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-lg p-2.5">
                  <AlertTriangle size={13} className="text-amber-400 flex-shrink-0" />
                  <span className="text-xs text-amber-300">
                    {missingFields.length} field{missingFields.length > 1 ? 's' : ''} missing — proposal will be less tailored
                  </span>
                </div>
              )}

              <button
                onClick={handleApprove}
                className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-400 text-white font-semibold py-3 rounded-xl transition-all text-sm"
              >
                Approve Brief
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center pb-4">
        <span className="text-xs text-gray-700">2 / 5</span>
      </div>
    </div>
  )
}
