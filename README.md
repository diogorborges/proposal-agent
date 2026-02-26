# Proposal Agent

AI-powered agentic workflow that transforms discovery call transcripts into polished sales proposals in minutes.

Built for the Lumenalta Hackathon — March 2026.

## What it does

1. **Upload** — paste a discovery call transcript (Fellow, Zoom, Teams, Gong)
2. **Brief** — Claude extracts 8 key fields automatically; flags missing ones in real time
3. **Generate** — produces a deck outline, talk track, and FAQ grounded in past proposals
4. **Review** — human checkpoint before anything is finalized
5. **Output** — download all 3 deliverables; saved to output library with auto-tags

## Running locally

```bash
git clone https://github.com/diogorborges/proposal-agent
cd proposal-agent
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**You will be prompted to enter an Anthropic API key on first load.**

- Get one at [console.anthropic.com](https://console.anthropic.com) → API Keys → Create Key
- You need to add a credit card and at least $5 in credits (no free tier for the API)
- The key is stored only in your browser's localStorage — never sent to any server other than Anthropic directly

## Stack

- **Framework:** Next.js 14 (App Router)
- **AI:** Claude via Anthropic SDK (streaming)
- **UI:** Tailwind CSS
- **State:** localStorage (no database)
