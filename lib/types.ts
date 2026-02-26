export interface ProposalBrief {
  client: string | null
  industry: string | null
  painPoints: string | null
  budget: string | null
  timeline: string | null
  stakeholders: string | null
  successCriteria: string | null
  competitiveContext: string | null
}

export interface MissingField {
  field: keyof ProposalBrief
  label: string
  reason: string
}

export interface DeckSlide {
  title: string
  bullets: string[]
  speakerNote: string
}

export interface FAQItem {
  question: string
  answer: string
}

export interface GeneratedProposal {
  deckOutline: DeckSlide[]
  talkTrack: string
  faq: FAQItem[]
  libraryReferences: LibraryReference[]
}

export interface LibraryEntry {
  id: string
  title: string
  industry: string
  tags: string[]
  summary: string
  content: string
}

export interface LibraryReference {
  id: string
  title: string
  similarity: number
}

export const REQUIRED_FIELDS: MissingField[] = [
  {
    field: 'client',
    label: 'Client Name',
    reason: 'Required to personalize every section of the proposal.',
  },
  {
    field: 'industry',
    label: 'Industry',
    reason: 'Determines which reference proposals and messaging frameworks to use.',
  },
  {
    field: 'painPoints',
    label: 'Pain Points',
    reason: 'Core of the value proposition — without this the proposal cannot be tailored.',
  },
  {
    field: 'budget',
    label: 'Budget Signal',
    reason: 'Critical for scoping the engagement and selecting the right offer tier.',
  },
  {
    field: 'timeline',
    label: 'Timeline',
    reason: 'Needed to frame urgency and phasing in the proposal.',
  },
  {
    field: 'stakeholders',
    label: 'Key Stakeholders',
    reason: 'Determines who the talk track should address and what objections to anticipate.',
  },
  {
    field: 'successCriteria',
    label: 'Success Criteria',
    reason: 'Defines how the client will measure ROI — anchors the entire narrative.',
  },
  {
    field: 'competitiveContext',
    label: 'Competitive Context',
    reason: 'Needed to position against alternatives the client is evaluating.',
  },
]
