<script lang="ts">
  import { renderMarkdown, renderMermaidDiagrams, renderBobDiagrams } from "../services/markdown";
  import type { LayoutMode } from "../types";

  let {
    content = "",
    filePath = "",
    layoutMode = "centered" as LayoutMode,
    onlayoutchange,
  }: {
    content?: string;
    filePath?: string;
    layoutMode?: LayoutMode;
    onlayoutchange?: (mode: LayoutMode) => void;
  } = $props();

  let htmlContent = $state("");

  $effect(() => {
    if (content) {
      renderMarkdown(content).then((html) => {
        htmlContent = html;
      });
    } else {
      htmlContent = "";
    }
  });

  // After HTML updates, render any mermaid and svgbob diagrams
  $effect(() => {
    if (htmlContent) {
      // Use requestAnimationFrame to wait for DOM update
      requestAnimationFrame(() => {
        renderMermaidDiagrams().catch(() => {
          // Mermaid errors are non-fatal (e.g. invalid diagram syntax)
        });
        renderBobDiagrams().catch(() => {
          // Bob diagram errors are non-fatal
        });
      });
    }
  });

  const fileName = $derived(filePath ? filePath.split(/[\\/]/).pop() ?? "" : "");
</script>

<div class="viewer" role="main" aria-label="Markdown viewer">
  {#if content}
    <header class="viewer-header">
      <span class="file-name" title={filePath}>{fileName}</span>
      <div class="layout-controls">
        <button class:active={layoutMode === "centered"} onclick={() => onlayoutchange?.("centered")} title="Single column">&#x2261;</button>
        <button class:active={layoutMode === "columns"} onclick={() => onlayoutchange?.("columns")} title="Multi-column">&#x229E;</button>
      </div>
    </header>
    <article class="markdown-body" class:centered={layoutMode === "centered"} class:columns={layoutMode === "columns"}>
      {@html htmlContent}
    </article>
  {:else}
    <div class="empty-state">
      <div class="empty-icon">📝</div>
      <h2>Planning Central</h2>
      <p>Select a markdown file from the sidebar to view it.</p>
    </div>
  {/if}
</div>

<style>
  .viewer {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }

  .viewer-header {
    padding: 12px 24px;
    border-bottom: 1px solid #2f3146;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .file-name {
    font-size: 13px;
    color: #7aa2f7;
    font-weight: 500;
  }

  .layout-controls {
    display: flex;
    gap: 4px;
  }

  .layout-controls button {
    background: transparent;
    border: 1px solid #2f3146;
    color: #565f89;
    border-radius: 4px;
    width: 28px;
    height: 28px;
    font-size: 16px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
  }

  .layout-controls button:hover {
    border-color: #7aa2f7;
    color: #7aa2f7;
  }

  .layout-controls button.active {
    background: #1a1b2e;
    border-color: #7aa2f7;
    color: #7aa2f7;
  }

  .markdown-body {
    flex: 1;
    overflow-y: auto;
    padding: 24px 32px;
  }

  .markdown-body.centered {
    max-width: 800px;
    margin: 0 auto;
    width: 100%;
  }

  .markdown-body.columns {
    column-width: 400px;
    column-gap: 48px;
    column-rule: 1px solid #2f3146;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #565f89;
    gap: 12px;
  }

  .empty-icon {
    font-size: 48px;
  }

  .empty-state h2 {
    color: #7aa2f7;
    font-size: 24px;
  }

  .empty-state p {
    font-size: 14px;
  }
</style>
