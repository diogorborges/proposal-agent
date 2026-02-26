import type { LibraryEntry } from './types'

export const MOCK_LIBRARY: LibraryEntry[] = [
  {
    id: 'finserv-2024',
    title: 'Global Bank Data Modernization — Winning Proposal 2024',
    industry: 'Financial Services',
    tags: ['financial-services', 'data-infrastructure', 'cloud-migration', 'compliance'],
    summary:
      'End-to-end data platform modernization for a Tier 1 bank. Replaced legacy mainframe pipelines with a cloud-native lakehouse architecture. Reduced reporting latency from 24h to under 2h. $4.2M engagement over 18 months.',
    content: `
## Executive Summary
The client faced critical challenges with aging data infrastructure that was limiting their ability to meet regulatory reporting deadlines and slowing down product development cycles. Our team proposed a phased migration to a modern lakehouse architecture built on AWS, with a strong emphasis on governance and compliance from day one.

## Key Pain Points Addressed
- Legacy batch processing causing 24-hour reporting delays
- Inability to run real-time fraud detection at scale
- Data silos across 12 business units with no unified data catalog
- Regulatory reporting taking 3x longer than industry benchmark

## Our Approach
Phase 1 (Months 1–4): Assessment and architecture design
Phase 2 (Months 5–10): Core platform build — ingestion, storage, transformation
Phase 3 (Months 11–18): Migration, decommissioning, and enablement

## Why We Won
We demonstrated deep financial services regulatory expertise (Basel III, SOX, BCBS 239) and provided a reference from a similar engagement at a regional bank. The phased approach de-risked the investment and allowed the client to see value within the first 90 days.

## Outcomes
- 89% reduction in reporting latency
- $1.8M annual savings in infrastructure costs
- Zero compliance incidents post-migration
- 4 new data products launched within 6 months of go-live
    `.trim(),
  },
  {
    id: 'healthcare-2024',
    title: 'Regional Health System — Clinical Analytics Platform',
    industry: 'Healthcare',
    tags: ['healthcare', 'analytics', 'HIPAA', 'interoperability', 'population-health'],
    summary:
      'Built a unified clinical analytics platform across a 14-hospital system. Integrated EHR, claims, and social determinants of health data. Enabled population health management at scale. $2.8M engagement.',
    content: `
## Executive Summary
A regional health system with 14 hospitals and 3,500 physicians needed to unify fragmented clinical data sources to power population health programs and meet value-based care targets. We delivered a HIPAA-compliant data platform that became the single source of truth for clinical and operational analytics.

## Key Pain Points Addressed
- 6 different EHR systems with no common data model
- Manual reconciliation of claims and clinical data taking weeks
- Inability to identify high-risk patients proactively
- Reporting for value-based contracts done manually in Excel

## Our Approach
We led with a clinical data architecture built on FHIR R4 standards, enabling true interoperability. Our team included former health system CDOs who understood the political complexity of multi-hospital data governance.

## Differentiators
- FHIR-native approach future-proofed against regulatory changes
- Pre-built connectors for Epic, Cerner, and Meditech
- Clinical AI models pre-validated on similar populations
- Dedicated change management stream — critical for physician adoption

## Outcomes
- 340,000 patients enrolled in proactive care management programs
- 23% reduction in preventable readmissions within 12 months
- $12M in avoided penalties under value-based contracts
- Platform certified for use in 3 additional states
    `.trim(),
  },
  {
    id: 'retail-2025',
    title: 'National Retailer — Real-Time Personalization Engine',
    industry: 'Retail & E-Commerce',
    tags: ['retail', 'personalization', 'real-time', 'ML', 'customer-data-platform'],
    summary:
      'Designed and delivered a real-time personalization engine for a national retailer with 800+ stores and 40M loyalty members. Increased e-commerce conversion by 34% and reduced churn by 18%. $3.5M engagement.',
    content: `
## Executive Summary
A national retailer was losing market share to digitally native competitors who could personalize at scale. Their existing recommendation engine was batch-based and 48 hours stale. We built a real-time customer data platform and ML-powered personalization engine that unified online and in-store signals.

## Key Pain Points Addressed
- Recommendations based on 48-hour-old data — irrelevant at point of purchase
- No unified customer identity across online, app, and in-store channels
- Marketing campaigns based on broad segments rather than individual behavior
- Data science team spending 70% of time on data wrangling, not modeling

## Our Approach
We started with a customer identity graph to unify fragmented identifiers across channels. We then built a feature store for real-time ML inference and an experimentation framework to continuously optimize models.

## Why We Won
We showed a working prototype using a sample of their own data within 2 weeks of the discovery call. This de-risked the technical feasibility concern and demonstrated our speed of execution.

## Outcomes
- 34% increase in e-commerce conversion rate
- 18% reduction in loyalty member churn
- 2.1x improvement in email campaign revenue
- Data science team productivity up 3x (70% less time on data prep)
    `.trim(),
  },
]

export function findSimilarProposals(
  brief: { industry: string | null; painPoints: string | null; tags?: string[] },
  topK = 3
): Array<{ entry: LibraryEntry; similarity: number }> {
  const query = [brief.industry, brief.painPoints].filter(Boolean).join(' ').toLowerCase()

  const scored = MOCK_LIBRARY.map((entry) => {
    const corpus = [entry.industry, entry.summary, entry.tags.join(' '), entry.title]
      .join(' ')
      .toLowerCase()

    const queryWords = query.split(/\s+/).filter((w) => w.length > 3)
    const matches = queryWords.filter((word) => corpus.includes(word)).length
    const similarity = queryWords.length > 0 ? Math.round((matches / queryWords.length) * 100) : 30

    const industryBoost =
      brief.industry && entry.industry.toLowerCase().includes(brief.industry.toLowerCase()) ? 15 : 0

    return {
      entry,
      similarity: Math.min(97, Math.max(35, similarity + industryBoost + Math.floor(Math.random() * 10))),
    }
  })

  return scored.sort((a, b) => b.similarity - a.similarity).slice(0, topK)
}
