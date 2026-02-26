import { NextRequest } from 'next/server'
import { createAnthropicClient, GENERATION_SYSTEM_PROMPT, buildGenerationPrompt } from '@/lib/claude'
import { findSimilarProposals } from '@/lib/mock-library'
import type { ProposalBrief, LibraryReference } from '@/lib/types'

export async function POST(request: NextRequest) {
  const apiKey = request.headers.get('x-api-key')
  if (!apiKey || apiKey.trim().length < 10) {
    return new Response(
      JSON.stringify({ error: 'Missing Anthropic API key.' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const body = await request.json()
  const brief: ProposalBrief = body.brief

  if (!brief) {
    return new Response(
      JSON.stringify({ error: 'Brief is required.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const similarProposals = findSimilarProposals(brief)
  const libraryReferences: LibraryReference[] = similarProposals.map(({ entry, similarity }) => ({
    id: entry.id,
    title: entry.title,
    similarity,
  }))

  const referenceContent = similarProposals
    .map(({ entry }) => `### ${entry.title}\n${entry.content}`)
    .join('\n\n---\n\n')

  const userPrompt = buildGenerationPrompt(brief, referenceContent)

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (type: string, data: unknown) => {
        const payload = `data: ${JSON.stringify({ type, data })}\n\n`
        controller.enqueue(encoder.encode(payload))
      }

      sendEvent('references', libraryReferences)
      sendEvent('status', { phase: 'deck', message: 'Building deck outline...' })

      let fullText = ''

      try {
        const anthropic = createAnthropicClient(apiKey)
        const claudeStream = anthropic.messages.stream({
          model: 'claude-haiku-4-5',
          max_tokens: 8192,
          system: GENERATION_SYSTEM_PROMPT,
          messages: [{ role: 'user', content: userPrompt }],
        })

        for await (const chunk of claudeStream) {
          if (
            chunk.type === 'content_block_delta' &&
            chunk.delta.type === 'text_delta'
          ) {
            fullText += chunk.delta.text
            sendEvent('chunk', { text: chunk.delta.text })

            if (fullText.includes('"talkTrack"') && !fullText.includes('"faq"')) {
              sendEvent('status', { phase: 'talktrack', message: 'Writing talk track...' })
            } else if (fullText.includes('"faq"')) {
              sendEvent('status', { phase: 'faq', message: 'Generating FAQ...' })
            }
          }
        }

        try {
          const cleaned = fullText
            .replace(/^```(?:json)?\s*/im, '')
            .replace(/\s*```\s*$/m, '')
            .trim()
          const jsonStart = cleaned.indexOf('{')
          const jsonEnd = cleaned.lastIndexOf('}') + 1
          const jsonStr = cleaned.slice(jsonStart, jsonEnd)
          console.log('[/api/generate] Parsing JSON, length:', jsonStr.length)
          const parsed = JSON.parse(jsonStr)
          sendEvent('complete', { ...parsed, libraryReferences })
        } catch (parseErr) {
          console.error('[/api/generate] Parse error:', parseErr)
          console.error('[/api/generate] Raw text start:', fullText.slice(0, 200))
          sendEvent('error', { message: 'Failed to parse generation output. Please try again.' })
        }
      } catch (err) {
        sendEvent('error', {
          message: err instanceof Error ? err.message : 'Generation failed. Please try again.',
        })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
