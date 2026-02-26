'use client'

import { Check } from 'lucide-react'

const STEPS = [
  { id: 1, label: 'Upload' },
  { id: 2, label: 'Brief' },
  { id: 3, label: 'Generating' },
  { id: 4, label: 'Review' },
  { id: 5, label: 'Output' },
]

interface StepBarProps {
  current: number
}

export default function StepBar({ current }: StepBarProps) {
  return (
    <div className="flex items-center justify-center gap-0 py-6">
      {STEPS.map((step, i) => {
        const done = step.id < current
        const active = step.id === current

        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all
                  ${done ? 'bg-green-500 text-white' : active ? 'bg-blue-500 text-white ring-4 ring-blue-500/20' : 'bg-[#1e2130] text-gray-500 border border-[#2d3148]'}
                `}
              >
                {done ? <Check size={14} strokeWidth={3} /> : step.id}
              </div>
              <span
                className={`text-xs font-medium ${active ? 'text-white' : done ? 'text-green-400' : 'text-gray-600'}`}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`w-16 h-px mb-5 mx-1 transition-all ${done ? 'bg-green-500' : 'bg-[#2d3148]'}`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
