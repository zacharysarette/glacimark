import { Marked } from "marked";
import hljs from "highlight.js";
import mermaid from "mermaid";
import { renderAsciiDiagram } from "./filesystem";

// Initialize mermaid with dark theme
mermaid.initialize({
  startOnLoad: false,
  theme: "dark",
  securityLevel: "loose",
});

// Unicode characters that unambiguously indicate an ASCII art diagram
const DIAGRAM_CHARS = /[─│┌┐└┘├┤┬┴┼═║╔╗╚╝╠╣╦╩╬╭╮╰╯→←↑↓┊┆]/;

function looksLikeDiagram(text: string): boolean {
  return DIAGRAM_CHARS.test(text);
}

function toBobBlock(text: string): string {
  const escaped = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return `<pre class="bob">${escaped}</pre>`;
}

// Create a configured Marked instance with syntax highlighting and mermaid support
const marked = new Marked({
  renderer: {
    code({ text, lang }: { text: string; lang?: string }) {
      // Mermaid blocks get rendered as pre.mermaid for mermaid.run() to pick up
      if (lang === "mermaid") {
        return `<pre class="mermaid">${text}</pre>`;
      }

      // Explicitly tagged bob/ascii blocks
      if (lang === "bob" || lang === "svgbob" || lang === "ascii-diagram") {
        return toBobBlock(text);
      }

      // All tagged code gets syntax highlighted
      if (lang && hljs.getLanguage(lang)) {
        const highlighted = hljs.highlight(text, { language: lang }).value;
        return `<pre><code class="hljs language-${lang}">${highlighted}</code></pre>`;
      }

      // Auto-detect: unlabeled blocks with box-drawing/arrow Unicode chars are diagrams
      if (!lang && looksLikeDiagram(text)) {
        return toBobBlock(text);
      }

      // Fallback: auto-detect language
      const highlighted = hljs.highlightAuto(text).value;
      return `<pre><code class="hljs">${highlighted}</code></pre>`;
    },
  },
});

export async function renderMarkdown(content: string): Promise<string> {
  return marked.parse(content) as Promise<string>;
}

export async function renderMermaidDiagrams(): Promise<void> {
  await mermaid.run({ querySelector: "pre.mermaid" });
}

export async function renderBobDiagrams(): Promise<void> {
  const elements = document.querySelectorAll("pre.bob");
  for (const el of elements) {
    const text = el.textContent ?? "";
    if (!text.trim()) continue;
    try {
      const svg = await renderAsciiDiagram(text);
      el.innerHTML = svg;
      el.classList.remove("bob");
      el.classList.add("bob-rendered");
    } catch {
      // Leave as plain text if rendering fails
    }
  }
}
