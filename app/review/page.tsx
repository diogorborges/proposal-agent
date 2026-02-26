'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ChevronDown,
  ChevronUp,
  LayoutTemplate,
  MessageSquare,
  HelpCircle,
  Shield,
  Check,
  ArrowRight,
  RotateCcw,
  ExternalLink,
} from 'lucide-react'
import Logo from '@/components/Logo'
import StepBar from '@/components/StepBar'
import { loadState } from '@/lib/store'
import type { GeneratedProposal } from '@/lib/types'

function CollapsibleSection({
  title,
  icon,
  preview,
  children,
  defaultOpen = false,
}: {
  title: string
  icon: React.ReactNode
  preview: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="bg-[#12151f] border border-[#2d3148] rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 hover:bg-[#1a1d2e] transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          {icon}
          <div>
            <span className="font-semibold text-white text-sm">{title}</span>
            {!open && (
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{preview}</p>
            )}
          </div>
        </div>
        {open ? (
          <ChevronUp size={16} className="text-gray-500 flex-shrink-0" />
        ) : (
          <ChevronDown size={16} className="text-gray-500 flex-shrink-0" />
        )}
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-[#2d3148]">
          {children}
        </div>
      )}
    </div>
  )
}

export default function ReviewScreen() {
  const router = useRouter()
  const [proposal, setProposal] = useState<GeneratedProposal | null>(null)
  const [comment, setComment] = useState('')
  const [approved, setApproved] = useState(false)

  useEffect(() => {
    const state = loadState()
    if (!state.proposal) {
      router.replace('/')
      return
    }
    setProposal(state.proposal)
  }, [router])

  const handleApprove = () => {
    setApproved(true)
    setTimeout(() => router.push('/output'), 600)
  }

  const handleRevise = () => {
    console.log('[Mock] Revision requested with comment:', comment)
    router.push('/generating')
  }

  if (!proposal) return null

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b border-[#1e2130]">
        <Logo />
        <span className="text-xs text-gray-500">Checkpoint 2 — Human Review</span>
      </header>

      <div className="flex-1 flex flex-col items-center px-4 py-4 max-w-6xl mx-auto w-full">
        <StepBar current={4} />

        <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">
          {/* Left — content preview */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <CollapsibleSection
              title="Deck Outline"
              icon={<LayoutTemplate size={18} className="text-blue-400" />}
              preview={proposal.deckOutline[0]?.title ?? ''}
              defaultOpen
            >
              <div className="mt-4 flex flex-col gap-4">
                {proposal.deckOutline.map((slide, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-7 h-7 bg-[#1e2130] border border-[#2d3148] rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-semibold text-gray-400">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{slide.title}</p>
                      {slide.bullets.length > 0 && (
                        <ul className="mt-1 flex flex-col gap-0.5">
                          {slide.bullets.map((b, bi) => (
                            <li key={bi} className="text-xs text-gray-400 flex items-start gap-1.5">
                              <span className="text-blue-500 mt-1 flex-shrink-0">·</span>
                              {b}
                            </li>
                          ))}
                        </ul>
                      )}
                      {slide.speakerNote && (
                        <p className="mt-1.5 text-xs text-gray-600 italic border-l-2 border-[#2d3148] pl-2">
                          {slide.speakerNote}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleSection>

            <CollapsibleSection
              title="Talk Track"
              icon={<MessageSquare size={18} className="text-purple-400" />}
              preview={proposal.talkTrack.slice(0, 120) + '...'}
            >
              <div className="mt-4 prose prose-sm max-w-none">
                <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {proposal.talkTrack}
                </p>
              </div>
            </CollapsibleSection>

            <CollapsibleSection
              title={`FAQ — ${proposal.faq.length} Questions`}
              icon={<HelpCircle size={18} className="text-green-400" />}
              preview={proposal.faq[0]?.question ?? ''}
            >
              <div className="mt-4 flex flex-col gap-4">
                {proposal.faq.map((item, i) => (
                  <div key={i}>
                    <p className="text-sm font-semibold text-white">Q: {item.question}</p>
                    <p className="text-sm text-gray-400 mt-1 leading-relaxed">A: {item.answer}</p>
                    {i < proposal.faq.length - 1 && (
                      <div className="mt-4 border-t border-[#2d3148]" />
                    )}
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          </div>

          {/* Right — checkpoint panel */}
          <div className="flex flex-col gap-4">
            <div className="bg-[#12151f] border border-[#2d3148] rounded-xl p-5">
              <div className="flex items-center gap-2 mb-1">
                <Shield size={15} className="text-blue-400" />
                <h2 className="text-sm font-semibold text-white">Checkpoint 2</h2>
              </div>
              <p className="text-xs text-gray-500 mb-4">
                Review and approve before this proposal is finalized and saved to the library.
              </p>

              {proposal.libraryReferences && proposal.libraryReferences.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2">Grounded in:</p>
                  <div className="flex flex-col gap-2">
                    {proposal.libraryReferences.map((ref) => (
                      <div
                        key={ref.id}
                        className="flex items-center justify-between bg-[#0F1117] border border-[#2d3148] rounded-lg px-3 py-2"
                      >
                        <span className="text-xs text-gray-300 truncate pr-2 leading-tight">
                          {ref.title.split('—')[0].trim()}
                        </span>
                        <span className="text-xs font-semibold text-blue-400 flex-shrink-0">
                          {ref.similarity}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-4">
                <label className="text-xs text-gray-400 mb-1.5 block">Comments or revision notes:</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="e.g. Strengthen the ROI section, add a timeline visual..."
                  className="w-full h-24 bg-[#0F1117] border border-[#2d3148] rounded-lg p-3 text-xs text-gray-200 placeholder-gray-600 resize-none focus:outline-none focus:border-blue-500/50 transition-all"
                />
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={handleApprove}
                  disabled={approved}
                  className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-400 disabled:bg-green-600 text-white font-semibold py-3 rounded-xl transition-all text-sm"
                >
                  {approved ? (
                    <>
                      <Check size={16} />
                      Approved!
                    </>
                  ) : (
                    <>
                      Approve & Finalize
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>

                <button
                  onClick={handleRevise}
                  className="w-full flex items-center justify-center gap-2 bg-[#0F1117] hover:bg-[#1a1d2e] border border-[#2d3148] hover:border-gray-500 text-gray-300 font-semibold py-3 rounded-xl transition-all text-sm"
                >
                  <RotateCcw size={14} />
                  Request Revision
                </button>
              </div>
            </div>

            <div className="bg-[#12151f] border border-[#2d3148] rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-2">Mock integrations</p>
              <div className="flex flex-col gap-2">
                <button className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors">
                  <ExternalLink size={12} />
                  View in Salesforce
                </button>
                <button className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors">
                  <ExternalLink size={12} />
                  Share in Slack
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center pb-4">
        <span className="text-xs text-gray-700">4 / 5</span>
      </div>
    </div>
  )
}
