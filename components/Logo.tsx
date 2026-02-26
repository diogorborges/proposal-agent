import { Zap } from 'lucide-react'

export default function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
        <Zap size={16} fill="white" color="white" />
      </div>
      <span className="font-semibold text-white text-sm tracking-wide">Proposal Agent</span>
    </div>
  )
}
