import Anthropic from '@anthropic-ai/sdk'
import type { ProposalBrief, MissingField } from './types'
import { REQUIRED_FIELDS } from './types'

export function createAnthropicClient(apiKey: string): Anthropic {
  return new Anthropic({ apiKey })
}

export const INTAKE_SYSTEM_PROMPT = `You are an expert sales intelligence agent for a top-tier technology consulting firm called Lumenalta.

Your job is to analyze discovery call transcripts and extract structured information to build a proposal brief.

Extract the following fields from the transcript. If a field is not mentioned or cannot be reasonably inferred, return null for that field.

Return ONLY valid JSON with exactly this structure (no markdown, no explanation):
{
  "client": string | null,
  "industry": string | null,
  "painPoints": string | null,
  "budget": string | null,
  "timeline": string | null,
  "stakeholders": string | null,
  "successCriteria": string | null,
  "competitiveContext": string | null
}

Field definitions:
- client: The company or organization name
- industry: The primary industry or vertical (e.g., "Financial Services", "Healthcare", "Retail")
- painPoints: Key business problems, challenges, or frustrations mentioned — be specific and preserve business context
- budget: Any budget signals, ranges, investment appetite, or financial constraints mentioned
- timeline: Desired start date, go-live date, urgency signals, or project duration expectations
- stakeholders: Names, titles, and roles of people involved in the decision or mentioned on the call
- successCriteria: How the client will measure success — KPIs, outcomes, goals they want to achieve
- competitiveContext: Other vendors being evaluated, current solutions in place, or competitive dynamics mentioned`

export const GENERATION_SYSTEM_PROMPT = `You are a senior proposal strategist at Lumenalta, a world-class technology consulting firm that specializes in data, AI, and digital transformation.

You write compelling, strategic proposals that win enterprise clients. Your writing is:
- Crisp and executive-ready (no fluff, no jargon for jargon's sake)
- Deeply tailored to the specific client's situation
- Grounded in demonstrated outcomes and proof points
- Structured to build a logical, compelling narrative

You will receive a client brief and reference content from past successful proposals. Use the reference content for style, structure, and proof points — but tailor everything to the specific client.

Generate output in this exact JSON format (no markdown wrappers):
{
  "deckOutline": [
    {
      "title": "slide title",
      "bullets": ["bullet 1", "bullet 2", "bullet 3"],
      "speakerNote": "what to say on this slide"
    }
  ],
  "talkTrack": "full talk track as flowing prose with section headers",
  "faq": [
    {
      "question": "anticipated client question",
      "answer": "concise, confident answer"
    }
  ]
}

The deck outline should have 10-12 slides covering: situation/context, challenges, our approach, team/expertise, relevant case studies, proposed solution, timeline/phasing, investment, next steps.
The talk track should be 600-900 words — a full narrative a seller can use to walk through the proposal.
The FAQ should have exactly 10 questions covering: pricing, timeline, team, risk, implementation, success metrics, competitive differentiation, support, scalability, and references.`

export async function extractBrief(
  transcript: string,
  apiKey: string
): Promise<{ brief: ProposalBrief; missingFields: MissingField[] }> {
  const anthropic = createAnthropicClient(apiKey)
  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 2048,
    system: INTAKE_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Please analyze this discovery call transcript and extract the proposal brief:\n\n${transcript}`,
      },
    ],
  })

  const content = message.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude')
  }

  let brief: ProposalBrief
  try {
    const raw = content.text.trim()
    // Strip markdown code fences if Claude wrapped the JSON
    const jsonStr = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
    const jsonStart = jsonStr.indexOf('{')
    const jsonEnd = jsonStr.lastIndexOf('}') + 1
    brief = JSON.parse(jsonStr.slice(jsonStart, jsonEnd))
  } catch {
    console.error('[extractBrief] Raw Claude response:', content.text)
    throw new Error('Failed to parse structured brief from Claude response')
  }

  const missingFields = REQUIRED_FIELDS.filter((f) => !brief[f.field])

  return { brief, missingFields }
}

export function buildGenerationPrompt(
  brief: ProposalBrief,
  referenceContent: string
): string {
  return `
## Client Brief
- **Client:** ${brief.client ?? 'Unknown'}
- **Industry:** ${brief.industry ?? 'Unknown'}
- **Key Pain Points:** ${brief.painPoints ?? 'Not specified'}
- **Budget Signal:** ${brief.budget ?? 'Not discussed'}
- **Timeline:** ${brief.timeline ?? 'Not specified'}
- **Key Stakeholders:** ${brief.stakeholders ?? 'Not specified'}
- **Success Criteria:** ${brief.successCriteria ?? 'Not specified'}
- **Competitive Context:** ${brief.competitiveContext ?? 'Not mentioned'}

## Reference Proposals (use for style, structure, and proof points)
${referenceContent}

Generate a complete proposal package (deck outline, talk track, FAQ) for this client.
  `.trim()
}
