'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  LayoutTemplate,
  MessageSquare,
  HelpCircle,
  Download,
  CheckCircle2,
  ExternalLink,
  Plus,
  Database,
} from 'lucide-react'
import Logo from '@/components/Logo'
import StepBar from '@/components/StepBar'
import { loadState, clearState } from '@/lib/store'
import type { GeneratedProposal, ProposalBrief } from '@/lib/types'

function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function formatDeckOutline(proposal: GeneratedProposal, brief: ProposalBrief | null): string {
  const lines: string[] = [
    `PROPOSAL DECK OUTLINE`,
    `Client: ${brief?.client ?? 'Unknown'}`,
    `Industry: ${brief?.industry ?? 'Unknown'}`,
    `Generated: ${new Date().toLocaleDateString()}`,
    '',
    '='.repeat(60),
    '',
  ]

  proposal.deckOutline.forEach((slide, i) => {
    lines.push(`Slide ${i + 1}: ${slide.title}`)
    slide.bullets.forEach((b) => lines.push(`  • ${b}`))
    if (slide.speakerNote) {
      lines.push(`  [Speaker note] ${slide.speakerNote}`)
    }
    lines.push('')
  })

  return lines.join('\n')
}

function formatTalkTrack(proposal: GeneratedProposal, brief: ProposalBrief | null): string {
  return [
    `TALK TRACK`,
    `Client: ${brief?.client ?? 'Unknown'}`,
    `Generated: ${new Date().toLocaleDateString()}`,
    '',
    '='.repeat(60),
    '',
    proposal.talkTrack,
  ].join('\n')
}

function formatFAQ(proposal: GeneratedProposal, brief: ProposalBrief | null): string {
  const lines: string[] = [
    `FREQUENTLY ASKED QUESTIONS`,
    `Client: ${brief?.client ?? 'Unknown'}`,
    `Generated: ${new Date().toLocaleDateString()}`,
    '',
    '='.repeat(60),
    '',
  ]

  proposal.faq.forEach((item, i) => {
    lines.push(`Q${i + 1}: ${item.question}`)
    lines.push(`A: ${item.answer}`)
    lines.push('')
  })

  return lines.join('\n')
}

function generateTags(brief: ProposalBrief | null): string[] {
  const tags: string[] = []
  if (brief?.industry) tags.push(brief.industry.toLowerCase().replace(/\s+/g, '-'))
  if (brief?.timeline) {
    const match = brief.timeline.match(/Q[1-4]\s*\d{4}|20\d{2}/)
    if (match) tags.push(match[0].toLowerCase().replace(/\s+/g, '-'))
  }
  if (brief?.painPoints) {
    const painKeywords = ['data', 'reporting', 'analytics', 'compliance', 'ai', 'cloud', 'infrastructure']
    painKeywords.forEach((k) => {
      if (brief.painPoints?.toLowerCase().includes(k)) tags.push(k)
    })
  }
  return [...new Set(tags)].slice(0, 5)
}

export default function OutputScreen() {
  const router = useRouter()
  const [proposal, setProposal] = useState<GeneratedProposal | null>(null)
  const [brief, setBrief] = useState<ProposalBrief | null>(null)
  const [downloaded, setDownloaded] = useState<Set<string>>(new Set())
  const [tags, setTags] = useState<string[]>([])

  useEffect(() => {
    const state = loadState()
    if (!state.proposal) {
      router.replace('/')
      return
    }
    setProposal(state.proposal)
    setBrief(state.brief)
    setTags(generateTags(state.brief))
  }, [router])

  const handleDownload = (type: 'deck' | 'talktrack' | 'faq') => {
    if (!proposal) return
    const client = brief?.client?.replace(/\s+/g, '-').toLowerCase() ?? 'client'
    const date = new Date().toISOString().split('T')[0]

    if (type === 'deck') {
      downloadTextFile(`${client}-deck-outline-${date}.txt`, formatDeckOutline(proposal, brief))
    } else if (type === 'talktrack') {
      downloadTextFile(`${client}-talk-track-${date}.txt`, formatTalkTrack(proposal, brief))
    } else {
      downloadTextFile(`${client}-faq-${date}.txt`, formatFAQ(proposal, brief))
    }

    setDownloaded((prev) => new Set([...prev, type]))
  }

  const handleNewProposal = () => {
    clearState()
    router.push('/')
  }

  if (!proposal) return null

  const outputCards = [
    {
      id: 'deck',
      label: 'Proposal Deck',
      icon: <LayoutTemplate size={20} className="text-blue-400" />,
      meta: `${proposal.deckOutline.length} slides · TXT`,
      color: 'blue',
    },
    {
      id: 'talktrack',
      label: 'Talk Track',
      icon: <MessageSquare size={20} className="text-purple-400" />,
      meta: `${Math.ceil(proposal.talkTrack.split(' ').length)} words · TXT`,
      color: 'purple',
    },
    {
      id: 'faq',
      label: 'FAQ',
      icon: <HelpCircle size={20} className="text-green-400" />,
      meta: `${proposal.faq.length} questions · TXT`,
      color: 'green',
    },
  ] as const

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b border-[#1e2130]">
        <Logo />
        <span className="text-xs text-gray-500">Proposal finalized</span>
      </header>

      <div className="flex-1 flex flex-col items-center px-4 py-4 max-w-3xl mx-auto w-full">
        <StepBar current={5} />

        <div className="w-full mt-4 flex flex-col items-center gap-6">
          {/* Success header */}
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center border border-green-500/30">
              <CheckCircle2 size={28} className="text-green-400" />
            </div>
            <h1 className="text-2xl font-semibold text-white">Proposal Finalized!</h1>
            <p className="text-gray-500 text-sm">
              {brief?.client ?? 'Client'} — {brief?.industry ?? 'Unknown Industry'}
            </p>
          </div>

          {/* Download cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
            {outputCards.map((card) => {
              const isDone = downloaded.has(card.id)
              return (
                <div
                  key={card.id}
                  className="bg-[#12151f] border border-[#2d3148] rounded-xl p-5 flex flex-col items-center gap-4"
                >
                  <div className="w-12 h-12 bg-[#1e2130] rounded-xl flex items-center justify-center border border-[#2d3148]">
                    {card.icon}
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-white">{card.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{card.meta}</p>
                  </div>
                  <button
                    onClick={() => handleDownload(card.id)}
                    className={`w-full flex items-center justify-center gap-2 text-sm font-semibold py-2.5 rounded-lg transition-all ${
                      isDone
                        ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                        : 'bg-blue-500 hover:bg-blue-400 text-white'
                    }`}
                  >
                    {isDone ? (
                      <>
                        <CheckCircle2 size={14} />
                        Downloaded
                      </>
                    ) : (
                      <>
                        <Download size={14} />
                        Download
                      </>
                    )}
                  </button>
                </div>
              )
            })}
          </div>

          {/* Library saved badge */}
          <div className="w-full bg-[#12151f] border border-[#2d3148] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Database size={15} className="text-blue-400" />
              <span className="text-sm font-semibold text-white">Saved to Output Library</span>
              <span className="ml-auto text-xs text-green-400 flex items-center gap-1">
                <CheckCircle2 size={12} />
                Auto-tagged
              </span>
            </div>
            {tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-[#1e2130] border border-[#2d3148] text-gray-400 rounded-full px-2.5 py-1"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500">No tags generated</p>
            )}
          </div>

          {/* Mock integrations */}
          <div className="w-full flex items-center justify-center gap-6">
            <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors">
              <ExternalLink size={12} />
              View in Salesforce
            </button>
            <div className="w-px h-4 bg-[#2d3148]" />
            <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors">
              <ExternalLink size={12} />
              Share in Slack
            </button>
          </div>

          {/* New proposal */}
          <button
            onClick={handleNewProposal}
            className="flex items-center gap-2 bg-[#12151f] hover:bg-[#1a1d2e] border border-[#2d3148] hover:border-gray-500 text-gray-300 font-semibold py-3 px-8 rounded-xl transition-all text-sm"
          >
            <Plus size={16} />
            New Proposal
          </button>
        </div>
      </div>

      <div className="text-center pb-4">
        <span className="text-xs text-gray-700">5 / 5</span>
      </div>
    </div>
  )
}
