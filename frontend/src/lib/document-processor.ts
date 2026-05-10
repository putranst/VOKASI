// VOKASI2 — Document Processing Pipeline
// Extracts text from PDF/DOCX, then generates Puck blocks via AI
// Adapted from MAIC-UI's ai_processor.py pipeline

import { generateFast, type PuckBlock } from "./openrouter";
import { generateHeavy } from "./heavy-generator";
import * as fs from "fs/promises";

export interface PageContent {
  pageNumber: number;
  text: string;
  sections: { heading: string; content: string }[];
}

export interface ExtractionResult {
  pages: PageContent[];
  totalPages: number;
  fullText: string;
  metadata: { title?: string; author?: string; subject?: string };
}

export interface ProcessingResult {
  blocks: PuckBlock[];
  extraction: ExtractionResult;
  mode: "fast" | "heavy";
  processingTimeMs: number;
}

// ─── PDF Extraction ─────────────────────────────────────────────────────

export async function extractPdfText(filePath: string): Promise<ExtractionResult> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any
  const pdfParse: any = require("pdf-parse");
  const buffer = await fs.readFile(filePath);
  const data = await pdfParse(buffer);

  const fullText: string = data.text ?? "";
  const totalPages: number = data.numpages ?? 0;

  const pages: PageContent[] = [];
  const pageTexts = splitIntoPages(fullText, totalPages);

  for (let i = 0; i < pageTexts.length; i++) {
    const text = pageTexts[i];
    pages.push({
      pageNumber: i + 1,
      text,
      sections: extractSections(text),
    });
  }

  return {
    pages,
    totalPages,
    fullText,
    metadata: {
      title: data.info?.Title ?? undefined,
      author: data.info?.Author ?? undefined,
      subject: data.info?.Subject ?? undefined,
    },
  };
}

// ─── DOCX Extraction ────────────────────────────────────────────────────

export async function extractDocxText(filePath: string): Promise<ExtractionResult> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any
  const mammoth: any = require("mammoth");
  const buffer = await fs.readFile(filePath);

  const textResult = await mammoth.extractRawText({ buffer });
  const fullText = textResult.value ?? "";

  const htmlResult = await mammoth.convertToHtml({ buffer });
  const html = htmlResult.value ?? "";

  const sections = extractSectionsFromHtml(html);
  const pages: PageContent[] = [];
  const chunks = chunkSections(sections, 3);

  chunks.forEach((chunk, i) => {
    const pageText = chunk.map((s) => `${s.heading}\n${s.content}`).join("\n\n");
    pages.push({
      pageNumber: i + 1,
      text: pageText,
      sections: chunk,
    });
  });

  if (pages.length === 0) {
    pages.push({
      pageNumber: 1,
      text: fullText,
      sections: [{ heading: "Document Content", content: fullText }],
    });
  }

  return {
    pages,
    totalPages: pages.length,
    fullText,
    metadata: {},
  };
}

// ─── Generic Extraction ─────────────────────────────────────────────────

export async function extractText(filePath: string, fileType: string): Promise<ExtractionResult> {
  switch (fileType) {
    case "pdf":
      return extractPdfText(filePath);
    case "docx":
      return extractDocxText(filePath);
    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }
}

// ─── AI Block Generation from Extracted Content ─────────────────────────

export async function generateBlocksFromDocument(
  extraction: ExtractionResult,
  options: {
    title?: string;
    domain?: string;
    targetAudience?: string;
    courseGoals?: string;
    mode?: "fast" | "heavy";
    model?: string;
    onStage?: (stage: string, message: string, percent: number) => void;
    onBlock?: (index: number, block: PuckBlock) => void;
  }
): Promise<PuckBlock[]> {
  const { mode = "fast" } = options;
  const content = buildContentForAI(extraction);

  if (mode === "heavy") {
    return generateHeavy({
      content,
      title: options.title ?? extraction.metadata.title ?? "Imported Document",
      domain: options.domain,
      targetAudience: options.targetAudience,
      courseGoals: options.courseGoals,
      model: options.model,
      onStage: options.onStage,
      onBlock: options.onBlock,
    });
  }

  return generateFast({
    content,
    title: options.title ?? extraction.metadata.title ?? "Imported Document",
    domain: options.domain,
    targetAudience: options.targetAudience,
    courseGoals: options.courseGoals,
    model: options.model,
  });
}

// ─── Full Processing Pipeline ───────────────────────────────────────────

export async function processDocument(
  filePath: string,
  fileType: string,
  options: {
    title?: string;
    domain?: string;
    targetAudience?: string;
    courseGoals?: string;
    mode?: "fast" | "heavy";
    model?: string;
    onStage?: (stage: string, message: string, percent: number) => void;
    onBlock?: (index: number, block: PuckBlock) => void;
  }
): Promise<ProcessingResult> {
  const startTime = Date.now();

  options.onStage?.("extracting", "Extracting text from document...", 10);
  const extraction = await extractText(filePath, fileType);

  options.onStage?.("generating", `Generating course from ${extraction.totalPages} pages...`, 30);
  const blocks = await generateBlocksFromDocument(extraction, options);

  const processingTimeMs = Date.now() - startTime;

  return {
    blocks,
    extraction,
    mode: options.mode ?? "fast",
    processingTimeMs,
  };
}

// ─── Helpers ────────────────────────────────────────────────────────────

function splitIntoPages(text: string, numPages: number): string[] {
  const formFeedSplit = text.split(/\f/);
  if (formFeedSplit.length > 1) {
    return formFeedSplit.map((p) => p.trim()).filter(Boolean);
  }

  if (numPages <= 1) return [text];
  const chunkSize = Math.ceil(text.length / numPages);
  const pages: string[] = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    pages.push(text.slice(i, i + chunkSize).trim());
  }
  return pages.filter(Boolean);
}

function extractSections(text: string): { heading: string; content: string }[] {
  const sections: { heading: string; content: string }[] = [];
  const lines = text.split("\n");
  let currentHeading = "Content";
  let currentContent: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    const isHeading =
      /^\d+(\.\d+)*\.?\s+/.test(trimmed) ||
      (trimmed === trimmed.toUpperCase() && trimmed.length > 3 && trimmed.length < 100) ||
      (trimmed.endsWith(":") && trimmed.length < 80 && !trimmed.includes(". "));

    if (isHeading && currentContent.length > 0) {
      sections.push({
        heading: currentHeading,
        content: currentContent.join("\n").trim(),
      });
      currentHeading = trimmed.replace(/:$/, "");
      currentContent = [];
    } else {
      currentContent.push(line);
    }
  }

  if (currentContent.length > 0) {
    sections.push({
      heading: currentHeading,
      content: currentContent.join("\n").trim(),
    });
  }

  return sections;
}

function extractSectionsFromHtml(html: string): { heading: string; content: string }[] {
  const sections: { heading: string; content: string }[] = [];
  const parts = html.split(/<h[1-3][^>]*>/i);

  for (const part of parts) {
    const headingMatch = part.match(/^([^<]*)<\/h[1-3]>/i);
    if (headingMatch) {
      const heading = headingMatch[1].replace(/<[^>]+>/g, "").trim();
      const content = part.slice(headingMatch[0].length).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      if (heading && content) {
        sections.push({ heading, content });
      }
    } else {
      const content = part.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      if (content) {
        sections.push({ heading: "Introduction", content });
      }
    }
  }

  return sections;
}

function chunkSections(
  sections: { heading: string; content: string }[],
  perChunk: number
): { heading: string; content: string }[][] {
  const chunks: { heading: string; content: string }[][] = [];
  for (let i = 0; i < sections.length; i += perChunk) {
    chunks.push(sections.slice(i, i + perChunk));
  }
  return chunks;
}

function buildContentForAI(extraction: ExtractionResult): string {
  const MAX_CHARS = 15000;
  let content = "";

  if (extraction.metadata.title) {
    content += `Title: ${extraction.metadata.title}\n\n`;
  }

  for (const page of extraction.pages) {
    const pageContent = `--- Page ${page.pageNumber} ---\n${page.text}\n\n`;
    if (content.length + pageContent.length > MAX_CHARS) {
      const remaining = MAX_CHARS - content.length;
      if (remaining > 200) {
        content += pageContent.slice(0, remaining) + "\n...[truncated]";
      }
      break;
    }
    content += pageContent;
  }

  return content;
}
