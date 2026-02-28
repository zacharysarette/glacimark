import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/svelte";

// Mock mermaid
vi.mock("mermaid", () => ({
  default: {
    initialize: vi.fn(),
    run: vi.fn().mockResolvedValue(undefined),
  },
}));

import MarkdownViewer from "./MarkdownViewer.svelte";

describe("MarkdownViewer", () => {
  it("shows empty state when no content", () => {
    render(MarkdownViewer, {
      props: { content: "", filePath: "" },
    });

    expect(screen.getByText("Planning Central")).toBeInTheDocument();
    expect(
      screen.getByText("Select a markdown file from the sidebar to view it.")
    ).toBeInTheDocument();
  });

  it("has the markdown viewer aria label", () => {
    render(MarkdownViewer, {
      props: { content: "", filePath: "" },
    });

    expect(screen.getByLabelText("Markdown viewer")).toBeInTheDocument();
  });

  it("shows file name in header when content is provided", async () => {
    render(MarkdownViewer, {
      props: { content: "# Hello", filePath: "/docs/test.md" },
    });

    // Wait for async markdown rendering
    await vi.waitFor(() => {
      expect(screen.getByText("test.md")).toBeInTheDocument();
    });
  });

  it("renders with centered class when layoutMode is centered", async () => {
    render(MarkdownViewer, {
      props: { content: "# Hello", filePath: "/docs/test.md", layoutMode: "centered" },
    });

    await vi.waitFor(() => {
      const article = document.querySelector("article.markdown-body");
      expect(article).not.toBeNull();
      expect(article!.classList.contains("centered")).toBe(true);
    });
  });

  it("renders with columns class when layoutMode is columns", async () => {
    render(MarkdownViewer, {
      props: { content: "# Hello", filePath: "/docs/test.md", layoutMode: "columns" },
    });

    await vi.waitFor(() => {
      const article = document.querySelector("article.markdown-body");
      expect(article).not.toBeNull();
      expect(article!.classList.contains("columns")).toBe(true);
    });
  });

  it("defaults to centered when no layoutMode prop", async () => {
    render(MarkdownViewer, {
      props: { content: "# Hello", filePath: "/docs/test.md" },
    });

    await vi.waitFor(() => {
      const article = document.querySelector("article.markdown-body");
      expect(article).not.toBeNull();
      expect(article!.classList.contains("centered")).toBe(true);
    });
  });

  it("shows layout toggle buttons in the header", async () => {
    render(MarkdownViewer, {
      props: { content: "# Hello", filePath: "/docs/test.md" },
    });

    await vi.waitFor(() => {
      expect(screen.getByTitle("Single column")).toBeInTheDocument();
      expect(screen.getByTitle("Multi-column")).toBeInTheDocument();
    });
  });
});
