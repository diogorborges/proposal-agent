import { NextRequest, NextResponse } from 'next/server'
import { extractBrief } from '@/lib/claude'

export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get('x-api-key')
    console.log('[/api/analyze] apiKey received:', apiKey ? `${apiKey.slice(0, 12)}...` : 'NONE')
    if (!apiKey || apiKey.trim().length < 10) {
      return NextResponse.json(
        { error: 'Missing Anthropic API key. Paste your key in the app settings.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { transcript } = body

    if (!transcript || typeof transcript !== 'string' || transcript.trim().length < 50) {
      return NextResponse.json(
        { error: 'Please provide a transcript with at least 50 characters.' },
        { status: 400 }
      )
    }

    const { brief, missingFields } = await extractBrief(transcript, apiKey)

    return NextResponse.json({ brief, missingFields })
  } catch (error) {
    console.error('[/api/analyze] Error:', error)
    const msg = error instanceof Error ? error.message : 'Failed to analyze transcript'

    // Surface billing/auth errors clearly
    if (msg.includes('credit') || msg.includes('billing') || msg.includes('insufficient') || msg.includes('402')) {
      return NextResponse.json(
        { error: 'Your Anthropic account has no credits. Add credits at console.anthropic.com → Billing → Add credit.' },
        { status: 402 }
      )
    }
    if (msg.includes('401') || msg.includes('authentication') || msg.includes('invalid x-api-key')) {
      return NextResponse.json(
        { error: 'Invalid API key. Double-check your key at console.anthropic.com → API Keys.' },
        { status: 401 }
      )
    }
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
