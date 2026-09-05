import { Document, Conversation, Message, User, MockPdfPage } from "@/types";

export const currentUser: User = {
  id: "usr_alex_chen",
  name: "Alex Chen",
  email: "alex.chen@example.com",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  dailyQueriesUsed: 15,
  dailyQueriesLimit: 25,
};

export const mockDocuments: Document[] = [
  {
    id: "doc-1",
    userId: "usr_alex_chen",
    filename: "Tesla_Q4_2025_Financial_Report.pdf",
    originalName: "Tesla_Q4_2025_Financial_Report.pdf",
    fileUrl: "/mock/Tesla_Q4_2025_Financial_Report.pdf",
    fileSize: 4404019, // ~4.2 MB
    pageCount: 28,
    chunkCount: 142,
    status: "READY",
    processingProgress: 100,
    error: null,
    createdAt: "2026-02-28T14:32:00Z",
    updatedAt: "2026-02-28T14:33:15Z",
    hasOpened: false,
  },
  {
    id: "doc-2",
    userId: "usr_alex_chen",
    filename: "Anthropic_Claude_3_Technical_Report.pdf",
    originalName: "Anthropic_Claude_3_Technical_Report.pdf",
    fileUrl: "/mock/Anthropic_Claude_3_Technical_Report.pdf",
    fileSize: 7130316, // ~6.8 MB
    pageCount: 42,
    chunkCount: 210,
    status: "READY",
    processingProgress: 100,
    error: null,
    createdAt: "2026-03-01T09:15:00Z",
    updatedAt: "2026-03-01T09:16:40Z",
    hasOpened: false,
  },
  {
    id: "doc-3",
    userId: "usr_alex_chen",
    filename: "Healthcare_AI_Compliance_Whitepaper.pdf",
    originalName: "Healthcare_AI_Compliance_Whitepaper.pdf",
    fileUrl: "/mock/Healthcare_AI_Compliance_Whitepaper.pdf",
    fileSize: 2202009, // ~2.1 MB
    pageCount: 16,
    chunkCount: 84,
    status: "EMBEDDING",
    processingProgress: 68,
    error: null,
    createdAt: "2026-03-03T18:45:00Z",
    updatedAt: "2026-03-03T18:45:45Z",
  },
  {
    id: "doc-4",
    userId: "usr_alex_chen",
    filename: "Corrupted_Scan_Archive_2024.pdf",
    originalName: "Corrupted_Scan_Archive_2024.pdf",
    fileUrl: "/mock/Corrupted_Scan_Archive_2024.pdf",
    fileSize: 1468006, // ~1.4 MB
    pageCount: 0,
    chunkCount: 0,
    status: "FAILED",
    processingProgress: 24,
    error: "Unable to read text from this scanned image. Please upload a searchable PDF file.",
    createdAt: "2026-03-02T11:20:00Z",
    updatedAt: "2026-03-02T11:21:05Z",
  },
];

// Dynamic relative timestamps for realistic display
const nowMs = Date.now();
const twoMinutesAgo = new Date(nowMs - 2 * 60 * 1000).toISOString();
const yesterday = new Date(nowMs - 26 * 60 * 60 * 1000).toISOString();
const threeDaysAgo = new Date(nowMs - 72 * 60 * 60 * 1000).toISOString();
const fourDaysAgo = new Date(nowMs - 96 * 60 * 60 * 1000).toISOString();

export const mockConversations: Conversation[] = [
  {
    id: "conv-1",
    userId: "usr_alex_chen",
    title: "Key findings",
    documentIds: ["doc-1"],
    lastMessageSnippet: "Tesla projects 2026 capital expenditures to be between $10.5B and $11.5B...",
    messageCount: 4,
    createdAt: new Date(nowMs - 4 * 60 * 60 * 1000).toISOString(),
    updatedAt: twoMinutesAgo,
  },
  {
    id: "conv-1b",
    userId: "usr_alex_chen",
    title: "Methodology",
    documentIds: ["doc-1"],
    lastMessageSnippet: "The cost reduction methodology focused on battery cathode contracts and unboxed pilot automation...",
    messageCount: 2,
    createdAt: new Date(nowMs - 30 * 60 * 60 * 1000).toISOString(),
    updatedAt: yesterday,
  },
  {
    id: "conv-1c",
    userId: "usr_alex_chen",
    title: "Market analysis",
    documentIds: ["doc-1"],
    lastMessageSnippet: "European vehicle volume rose 12% YoY while China deliveries faced an estimated 140 bps ASP contraction...",
    messageCount: 2,
    createdAt: new Date(nowMs - 80 * 60 * 60 * 1000).toISOString(),
    updatedAt: threeDaysAgo,
  },
  {
    id: "conv-2",
    userId: "usr_alex_chen",
    title: "Claude 3 Benchmark & Vision Capabilities",
    documentIds: ["doc-2"],
    lastMessageSnippet: "Across mathematical reasoning (GSM8K) and code generation (HumanEval)...",
    messageCount: 2,
    createdAt: new Date(nowMs - 40 * 60 * 60 * 1000).toISOString(),
    updatedAt: yesterday,
  },
  {
    id: "conv-2b",
    userId: "usr_alex_chen",
    title: "Multimodal Reasoning & Architecture",
    documentIds: ["doc-2"],
    lastMessageSnippet: "MMMU benchmark results (59.4%) demonstrate leading diagram and chart synthesis...",
    messageCount: 2,
    createdAt: new Date(nowMs - 90 * 60 * 60 * 1000).toISOString(),
    updatedAt: fourDaysAgo,
  },
  {
    id: "conv-3",
    userId: "usr_alex_chen",
    title: "Multi-Document Strategy Overview",
    documentIds: ["doc-1", "doc-2"],
    lastMessageSnippet: "Comparing technological and capital investment trajectories between hardware and AI foundation labs...",
    messageCount: 2,
    createdAt: new Date(nowMs - 50 * 60 * 60 * 1000).toISOString(),
    updatedAt: yesterday,
  },
];

export const mockMessages: Record<string, Message[]> = {
  "conv-1": [
    {
      id: "msg-1",
      conversationId: "conv-1",
      role: "user",
      content: "What were the primary drivers for Tesla's automotive gross margin in Q4 2025?",
      createdAt: new Date(nowMs - 3 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "msg-2",
      conversationId: "conv-1",
      role: "assistant",
      content: `According to the **Q4 2025 Financial Report**, automotive gross margin (excluding regulatory credits) was influenced by three key factors:

1. **Cost of Goods Sold (COGS) Reduction**: Per-vehicle cost declined to an all-time low of approximately **$35,100**, driven by raw material deflation (specifically battery-grade lithium and cathode materials) and manufacturing efficiencies from unboxed pilot lines.
2. **Energy Storage Growth**: Megapack and Powerwall gross margins exceeded **24%**, offsetting regional vehicle pricing adjustments.
3. **FSD Revenue Recognition**: Recognized **$320M** in deferred revenue upon rollout of supervised FSD features.

However, price reductions in European and Chinese markets created an estimated **140 bps headwind** on average selling price (ASP).`,
      sources: [
        {
          documentId: "doc-1",
          documentName: "Tesla_Q4_2025_Financial_Report.pdf",
          page: 12,
          chunkIndex: 34,
          textSnippet: "Automotive gross margin (ex-regulatory credits) adjusted to 17.8%. Reductions in per-vehicle COGS ($35.1k average) offset regional pricing adjustments across APAC and EMEA.",
          relevanceScore: 0.94,
        },
        {
          documentId: "doc-1",
          documentName: "Tesla_Q4_2025_Financial_Report.pdf",
          page: 15,
          chunkIndex: 41,
          textSnippet: "Deferred revenue recognition relating to FSD version releases totaled $320M in the fourth quarter, contributing positively to automotive GAAP gross margin.",
          relevanceScore: 0.89,
        },
      ],
      createdAt: new Date(nowMs - 3 * 60 * 60 * 1000 + 4000).toISOString(),
    },
    {
      id: "msg-3",
      conversationId: "conv-1",
      role: "user",
      content: "Can you break down the capital expenditures (CapEx) guidance for 2026?",
      createdAt: new Date(nowMs - 3 * 60 * 1000).toISOString(),
    },
    {
      id: "msg-4",
      conversationId: "conv-1",
      role: "assistant",
      content: `Based on **Page 18** of the financial statement, Tesla projects 2026 capital expenditures to be between **$10.5B and $11.5B**.

The planned allocation prioritizes three major initiatives:
* **Compute Infrastructure & AI Clusters**: Continued scaling of GPU clusters (expanding to over 100,000 H100/B200 equivalents) and Dojo custom silicon expansion.
* **Next-Generation Vehicle Lines**: Tooling and initial pilot manufacturing lines for the affordable model platform.
* **Energy Storage Production Expansion**: Doubling annual capacity at the Lathrop Megafactory and construction of the Shanghai Megapack facility.`,
      sources: [
        {
          documentId: "doc-1",
          documentName: "Tesla_Q4_2025_Financial_Report.pdf",
          page: 18,
          chunkIndex: 56,
          textSnippet: "Capital expenditures for FY 2026 are forecasted between $10.5B and $11.5B, driven by compute clusters, next-gen vehicle tooling, and energy manufacturing expansion.",
          relevanceScore: 0.92,
        },
      ],
      createdAt: new Date(nowMs - 2 * 60 * 1000).toISOString(),
    },
  ],
  "conv-1b": [
    {
      id: "msg-1b-1",
      conversationId: "conv-1b",
      role: "user",
      content: "Explain the methodology used for per-vehicle COGS reduction.",
      createdAt: new Date(nowMs - 28 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "msg-1b-2",
      conversationId: "conv-1b",
      role: "assistant",
      content: `As detailed on **Page 12** under Operations & Cost Management:

The cost optimization methodology relies on three distinct pillars:
1. **Vertical Battery Integration**: In-house cathode assembly and revised long-term lithium supply contracts reduced pack-level costs by approximately **$1,200 per vehicle**.
2. **Subassembly Automation**: Simplified wiring architecture and single-piece castings reduced assembly cycle times by **18%**.
3. **Logistics Localization**: Factory-proximate supplier clusters lowered freight expenses by **$380 per unit**.`,
      sources: [
        {
          documentId: "doc-1",
          documentName: "Tesla_Q4_2025_Financial_Report.pdf",
          page: 12,
          chunkIndex: 35,
          textSnippet: "Cost optimization methodology: localized supply clusters and simplified pack architecture lowered per-unit manufacturing outlays to $35,100.",
          relevanceScore: 0.95,
        },
      ],
      createdAt: new Date(nowMs - 26 * 60 * 60 * 1000).toISOString(),
    },
  ],
  "conv-1c": [
    {
      id: "msg-1c-1",
      conversationId: "conv-1c",
      role: "user",
      content: "What is the market analysis for European and Chinese deliveries?",
      createdAt: new Date(nowMs - 75 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "msg-1c-2",
      conversationId: "conv-1c",
      role: "assistant",
      content: `According to **Page 8** of the filing, the regional market dynamics were divergent:

* **Europe (EMEA)**: Deliveries grew **12% year-over-year**, bolstered by steady demand for Model Y in Germany, the UK, and Nordic markets.
* **China (APAC)**: Experienced intensified domestic competition, necessitating selective price incentives that resulted in a **140 bps headwind** on average selling price (ASP).
* **Energy Storage**: Megapack deployment in APAC partially compensated for automotive margin pressures.`,
      sources: [
        {
          documentId: "doc-1",
          documentName: "Tesla_Q4_2025_Financial_Report.pdf",
          page: 8,
          chunkIndex: 18,
          textSnippet: "Regional delivery analysis: EMEA grew 12% YoY, while APAC pricing adjustments exerted a 140 bps headwind on consolidated automotive gross margin.",
          relevanceScore: 0.93,
        },
      ],
      createdAt: new Date(nowMs - 72 * 60 * 60 * 1000).toISOString(),
    },
  ],
  "conv-2": [
    {
      id: "msg-201",
      conversationId: "conv-2",
      role: "user",
      content: "How does Claude 3 Opus compare against other models on vision and coding benchmarks?",
      createdAt: new Date(nowMs - 38 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "msg-202",
      conversationId: "conv-2",
      role: "assistant",
      content: `According to the **Anthropic Claude 3 Technical Report**, Claude 3 Opus demonstrates state-of-the-art results across both vision reasoning and coding tasks:

* **HumanEval (Coding)**: Scored **84.9%** 0-shot, showing deep synthesis capabilities in complex multi-step Python programming tasks.
* **GSM8K (Math Reasoning)**: Achieved **95.0%** with chain-of-thought, establishing top-tier mathematical deduction.
* **MMMU (Multimodal Reasoning)**: Scored **59.4%**, leading in diagram parsing, scientific charts, and visual problem solving.

The report highlights that Claude 3 models exhibit an order-of-magnitude reduction in incorrect refusals compared to earlier generations.`,
      sources: [
        {
          documentId: "doc-2",
          documentName: "Anthropic_Claude_3_Technical_Report.pdf",
          page: 8,
          chunkIndex: 22,
          textSnippet: "Claude 3 Opus achieves state-of-the-art results on MMMU (59.4%), HumanEval (84.9%), and GSM8K (95.0%), demonstrating robust visual and algorithmic reasoning.",
          relevanceScore: 0.96,
        },
      ],
      createdAt: new Date(nowMs - 26 * 60 * 60 * 1000).toISOString(),
    },
  ],
  "conv-2b": [
    {
      id: "msg-2b-1",
      conversationId: "conv-2b",
      role: "user",
      content: "What does the report say about multimodal training architecture and vision benchmarks?",
      createdAt: new Date(nowMs - 95 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "msg-2b-2",
      conversationId: "conv-2b",
      role: "assistant",
      content: `Based on **Page 14** of the report:

Claude 3 models utilize an integrated vision-language encoder trained jointly on text and high-resolution visual tokens. Key highlights include:
* **Resolution Independence**: Accepts arbitrary aspect ratios and resolutions up to 2.5 megapixels without cropping distortions.
* **Chart & Diagram Parsing**: Exceeds prior foundation models on MathVista (67.7%) and DocVQA (89.3%).
* **Safety Alignment**: Robust refusal of adversarial visual prompts while maintaining lower refusal rates on benign scientific documents.`,
      sources: [
        {
          documentId: "doc-2",
          documentName: "Anthropic_Claude_3_Technical_Report.pdf",
          page: 14,
          chunkIndex: 40,
          textSnippet: "Multimodal architecture: Joint vision-language pretraining enables arbitrary resolution scaling with state-of-the-art results on DocVQA (89.3%) and MathVista (67.7%).",
          relevanceScore: 0.94,
        },
      ],
      createdAt: new Date(nowMs - 94 * 60 * 60 * 1000).toISOString(),
    },
  ],
  "conv-3": [
    {
      id: "msg-301",
      conversationId: "conv-3",
      role: "user",
      content: "Compare the AI compute investment discussed in the Tesla report with the scaling notes in Anthropic's paper.",
      createdAt: new Date(nowMs - 45 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "msg-302",
      conversationId: "conv-3",
      role: "assistant",
      content: `When analyzing both documents together:

1. **Tesla's Compute Trajectory (Doc 1, Page 18)** focuses on end-to-end vision neural networks for autonomous physical robotics, budgeting part of a **$10.5B–$11.5B** CapEx to reach 100,000+ AI accelerator equivalents.
2. **Anthropic's Technical Report (Doc 2, Page 24)** outlines foundation model scaling laws, emphasizing distributed cluster training with custom FP8 precision and high-bandwidth interconnects to prevent communication bottlenecks during pretraining.`,
      sources: [
        {
          documentId: "doc-1",
          documentName: "Tesla_Q4_2025_Financial_Report.pdf",
          page: 18,
          chunkIndex: 56,
          textSnippet: "Capital expenditures for FY 2026 are forecasted between $10.5B and $11.5B, driven by compute clusters and facility expansion.",
          relevanceScore: 0.91,
        },
        {
          documentId: "doc-2",
          documentName: "Anthropic_Claude_3_Technical_Report.pdf",
          page: 24,
          chunkIndex: 68,
          textSnippet: "Large-scale pretraining required cluster-wide FP8 optimizers with low-latency interconnects to sustain near-linear scaling across thousands of nodes.",
          relevanceScore: 0.88,
        },
      ],
      createdAt: new Date(nowMs - 26 * 60 * 60 * 1000).toISOString(),
    },
  ],
};

export const mockPdfDocumentPages: Record<string, MockPdfPage[]> = {
  "doc-1": [
    {
      pageNumber: 1,
      title: "Tesla, Inc. Q4 and Full Year 2025 Financial Update",
      paragraphs: [
        "Executive Summary: In 2025, we continued our mission to accelerate the world's transition to sustainable energy. Total revenue reached $104.2 billion, with our energy storage business achieving record deployment and operating profitability.",
        "Operational Highlights: Vehicle deliveries reached 1.95 million units globally. Production efficiencies across Fremont, Shanghai, Berlin, and Austin contributed to stabilizing automotive margins despite macroeconomic pricing pressure.",
      ],
    },
    {
      pageNumber: 12,
      title: "Automotive Gross Margin & Unit Cost Economics",
      paragraphs: [
        "Automotive gross margin (ex-regulatory credits) adjusted to 17.8% in Q4 2025, up 70 basis points sequentially from Q3.",
        "Reductions in per-vehicle cost of goods sold (COGS) reached an average of $35,100 per unit, representing significant savings in raw materials including battery-grade lithium carbonate, nickel, and localized supply chain integration.",
        "Regional price adjustments in key Asia-Pacific and European markets represented a 140 bps headwind on net average realized revenue per vehicle.",
      ],
      hasHighlight: true,
      highlightSnippet: "Automotive gross margin (ex-regulatory credits) adjusted to 17.8%... Reductions in per-vehicle COGS reached $35,100.",
      tableData: {
        headers: ["Metric", "Q4 2024", "Q3 2025", "Q4 2025", "YoY Change"],
        rows: [
          ["Automotive GAAP Gross Margin", "18.2%", "17.9%", "18.6%", "+40 bps"],
          ["Gross Margin (Ex-Credits)", "17.2%", "17.1%", "17.8%", "+60 bps"],
          ["Average COGS per vehicle", "$36,400", "$35,800", "$35,100", "-3.6%"],
          ["Regulatory Credits", "$512M", "$480M", "$495M", "-3.3%"],
        ],
      },
    },
    {
      pageNumber: 15,
      title: "Deferred Revenue & Software Services Monetization",
      paragraphs: [
        "Software and services revenue grew 28% year-over-year, supported by accelerated paid adoption of Full Self-Driving (Supervised) and premium connectivity packages.",
        "Deferred revenue recognition relating to FSD version releases totaled $320M in the fourth quarter, reflecting wide customer deployment of version 13.x features and customer satisfaction milestone achievements.",
      ],
      hasHighlight: true,
      highlightSnippet: "Deferred revenue recognition relating to FSD version releases totaled $320M in the fourth quarter.",
    },
    {
      pageNumber: 18,
      title: "Capital Expenditures & 2026 Strategic Outlook",
      paragraphs: [
        "Capital expenditures for FY 2026 are forecasted between $10.5B and $11.5B, driven by compute clusters, next-gen vehicle tooling, and energy manufacturing expansion.",
        "AI compute cluster expansions will scale our internal training capacity beyond 100,000 H100-equivalent accelerators to power unsupervised autonomy models and humanoid robotics training pipelines.",
        "Free cash flow generation remained robust at $3.8 billion for the full year 2025, providing strong liquidity of $31.2 billion in cash and marketable investments.",
      ],
      hasHighlight: true,
      highlightSnippet: "Capital expenditures for FY 2026 are forecasted between $10.5B and $11.5B, driven by compute clusters...",
      tableData: {
        headers: ["Capex Category", "2024 Actual", "2025 Actual", "2026 Projected"],
        rows: [
          ["Manufacturing Facilities & Tooling", "$5.2B", "$4.8B", "$5.0B - $5.5B"],
          ["AI Compute & Data Centers", "$2.8B", "$3.5B", "$4.0B - $4.5B"],
          ["Supercharger & Energy Network", "$1.2B", "$1.1B", "$1.5B"],
          ["Total CapEx", "$9.2B", "$9.4B", "$10.5B - $11.5B"],
        ],
      },
    },
    {
      pageNumber: 28,
      title: "Consolidated Balance Sheets & Statement of Cash Flows",
      paragraphs: [
        "Tesla closed fiscal year 2025 with $31.2 billion in total cash, cash equivalents, and short-term investments, an increase of $2.1 billion compared to year-end 2024.",
        "Total debt excluding vehicle and energy product financing remained minimal at under $1.0 billion.",
      ],
    },
  ],
  "doc-2": [
    {
      pageNumber: 1,
      title: "The Claude 3 Model Family: Opus, Sonnet, Haiku",
      paragraphs: [
        "We introduce Claude 3, a family of state-of-the-art multimodal models comprising Claude 3 Haiku, Claude 3 Sonnet, and Claude 3 Opus. Opus represents our most capable model, outperforming contemporary frontier models across core evaluation benchmarks.",
      ],
    },
    {
      pageNumber: 8,
      title: "Core Cognitive and Multimodal Benchmarks",
      paragraphs: [
        "Claude 3 Opus achieves state-of-the-art results on MMMU (59.4%), HumanEval (84.9%), and GSM8K (95.0%), demonstrating robust visual and algorithmic reasoning.",
        "Vision capabilities show marked improvements in analyzing engineering diagrams, scientific charts, financial tables, and low-resolution photographic inputs.",
      ],
      hasHighlight: true,
      highlightSnippet: "Claude 3 Opus achieves state-of-the-art results on MMMU (59.4%), HumanEval (84.9%), and GSM8K (95.0%).",
    },
    {
      pageNumber: 24,
      title: "Pretraining Infrastructure & Distributed Scaling",
      paragraphs: [
        "Large-scale pretraining required cluster-wide FP8 optimizers with low-latency interconnects to sustain near-linear scaling across thousands of nodes.",
        "Fault tolerance mechanisms ensured checkpoint resumption within 4 minutes of node degradation, minimizing idle compute time during prolonged training runs.",
      ],
      hasHighlight: true,
      highlightSnippet: "Large-scale pretraining required cluster-wide FP8 optimizers with low-latency interconnects...",
    },
  ],
};

export const suggestedQuestions: string[] = [
  "What were the primary drivers for automotive gross margins in Q4?",
  "What is the CapEx projection and breakdown for 2026?",
  "Summarize key revenue recognitions from software and FSD.",
  "What are the main risks and headwind factors mentioned?",
];
