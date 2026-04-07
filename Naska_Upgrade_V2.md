Naska Studio is not merely a documentation tool; it is a Cognitive Operating System designed to facilitate the transition from a "Passive Consumer" to an "Active Producer." By synthesizing the architectural flexibility of Notion with the grounded intelligence of NotebookLM, the Studio becomes the primary workspace for the IRIS Cycle.

The objective is to move away from static course folders toward a Spatial Knowledge Environment where every block of text is live, interlinked, and grounded in authentic institutional context.

1. The Two Specialized Learning Architectures
To maximize the efficiency of the T6 platform, Naska Studio must support two distinct cognitive pathways:

Pathway A: The IRIS Sprint (Deep Competency)
Designed for intensive, 4-week upskilling cycles where the goal is rapid, rigorous competency development.

Phase 1: Immersion Interface: The Studio begins as a "Field Journal." It is pre-loaded with stakeholder interview templates and root-cause analysis blocks to capture authentic problem contexts.

Phase 2: Reflection Workspace: The user is prompted to map their observations to SFIA competency levels. Naska identifies "Capability Gaps" by comparing the user's field notes to the required skill standards.

Phase 3: Iteration Canvas (The Reverse Trivium Moment): This is the core "Rhetoric" phase where the user drafts prototypes or proposals. Naska acts as a sparring partner, querying the Personal Knowledge Container (PKC) to surface relevant "Grammar" (facts/principles) precisely when logic gaps are detected.

Phase 4: Scale & Deployment: The final manuscript is validated against institutional requirements, generating the evidence required for W3C verifiable credentials.

Pathway B: General MOOC / MAIC (Continuous Upskilling)
Designed for broader, module-based learning and AI literacy programs.

Modular Synthesis: Instead of a linear sprint, the Studio acts as a Relational Wiki. Each course module is a source that can be cross-referenced with personal notes.

Active Recall Blocks: Naska automatically generates "Socratic Question Blocks" based on the student's unique notes, forcing retrieval practice—a mechanism proven to enhance long-term retention.

Automated Digesting: A feature that synthesizes live class transcripts and PDFs into 5-minute audio or text summaries, allowing for high-velocity "Inquiry" during the learning process.

2. Naska Studio Features (Notion + NotebookLM Hybrid)
The interface must transition from the current mock state to a block-based system where "Sources" and "Drafting" live in a unified feedback loop.

Source-Grounded Sidebar: A panel on the left for managing "Inquiry Sources" (live class transcripts, research PDFs, YouTube links). Students can select specific sources to "focus" Naska’s context window.

The Block Editor (Studio Blocks):

Insight Block: Real-time AI summaries that update as the user adds new sources.

Evidence Block: Automatically gathers and formats all citations used in the current draft to ensure academic and professional rigor.

Logic-Gap Indicator: A subtle marginalia icon that appears when the AI detects an unsupported claim or a contradiction between the draft and the sources.

The Reality Engine Sandbox: A built-in terminal or low-code environment for the "Iteration" phase, allowing students to test hypotheses (Iteration) without leaving their manuscript.

3. Implementation Plan for AntiGravity (Live Backend Transition)
This plan moves the system from frontend mocks to a live RAG-driven infrastructure.

Backend & Data (The PKC Foundation)
Task 1: Multi-Tenant Vector Store: Implement pgvector in the PostgreSQL instance to store the PKC. Each user must have an isolated namespace to prevent cross-contamination.

Task 2: Ingestion Pipeline: Create an automated worker to transcribe live T6 Zoom/Teams sessions and index them into the LlamaIndex retriever.

Task 3: The Socratic Router: Configure the "Brain" to prioritize Gemini 3 Pro for long-context analysis (Immersion) and OpenRouter (Claude 3.5) for logic-gap detection during the Iteration phase.