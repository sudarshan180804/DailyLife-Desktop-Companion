import React from "react";
import { nativeDialogService } from "../../services/nativeDialogService";

export interface MarkdownHeadingItem {
  id: string;
  text: string;
  level: number;
}

interface MarkdownRendererProps {
  content: string;
  onWikiLinkClick?: (noteTitle: string) => void;
  onToggleCheckbox?: (lineIndex: number, newChecked: boolean) => void;
  className?: string;
}

export function extractHeadings(mdText: string): MarkdownHeadingItem[] {
  if (!mdText) return [];
  const lines = mdText.split("\n");
  const headings: MarkdownHeadingItem[] = [];

  lines.forEach((line) => {
    const match = line.match(/^(#{1,6})\s+(.*)/);
    if (match) {
      const level = match[1].length;
      const text = match[2].replace(/[*_`#]/g, "").trim();
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      headings.push({ id, text, level });
    }
  });

  return headings;
}

export function parseMarkdownToHTML(mdText: string): string {
  if (!mdText) return "";

  let raw = mdText;

  // Escape basic script tags
  raw = raw.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");

  // Display Math $$...$$
  raw = raw.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
    return `<div class="md-math-block">$$\\displaystyle ${math.trim()}$$</div>`;
  });

  // Inline Math $...$
  raw = raw.replace(/\$([^$\n]+)\$/g, (_, math) => {
    return `<span class="md-math-inline">$${math.trim()}$</span>`;
  });

  // Mermaid Diagram Blocks ```mermaid
  raw = raw.replace(/```mermaid\n([\s\S]*?)```/g, (_, code) => {
    const cleanCode = code.replace(/</g, "&lt;").replace(/>/g, "&gt;").trim();
    return `<div class="md-mermaid-card"><div class="mermaid-hdr">📊 MERMAID DIAGRAM</div><pre class="mermaid-code-content">${cleanCode}</pre></div>`;
  });

  // Code blocks (fenced ```)
  const codeBlocks: string[] = [];
  raw = raw.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (_, lang, code) => {
    const idx = codeBlocks.length;
    const cleanCode = code.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const langLabel = lang ? lang.toUpperCase() : "CODE";
    codeBlocks.push(
      `<div class="md-code-frame"><div class="code-frame-hdr"><span>💻 ${langLabel}</span><button class="code-copy-btn" onclick="navigator.clipboard.writeText(this.parentNode.nextURI.innerText)">Copy</button></div><pre class="md-code-block"><code class="language-${lang}">${cleanCode}</code></pre></div>`
    );
    return `___CODE_BLOCK_${idx}___`;
  });

  // Inline Code `code`
  const inlineCodes: string[] = [];
  raw = raw.replace(/`([^`]+)`/g, (_, code) => {
    const idx = inlineCodes.length;
    const cleanCode = code.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    inlineCodes.push(`<code class="md-inline-code">${cleanCode}</code>`);
    return `___INLINE_CODE_${idx}___`;
  });

  // Internal Wiki Links [[Note Title]]
  raw = raw.replace(/\[\[([^\]]+)\]\]/g, (_, wikiTitle) => {
    const cleanTitle = wikiTitle.trim();
    return `<a class="md-wiki-link" data-wikititle="${encodeURIComponent(
      cleanTitle
    )}">📄 [[${cleanTitle}]]</a>`;
  });

  // Images ![alt](url)
  raw = raw.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, src) => {
    const formattedUrl = nativeDialogService.formatAssetUrl(src);
    return `<div class="md-image-frame"><img src="${formattedUrl}" alt="${alt}" class="md-img" /><span class="md-img-caption">${alt}</span></div>`;
  });

  // Links [text](url)
  raw = raw.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, href) => {
    return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="md-external-link">${text} ↗</a>`;
  });

  // Headers # - ###### with generated anchors
  raw = raw.replace(/^######\s+(.*$)/gim, (_, text) => {
    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    return `<h6 id="${id}" class="md-h6">${text}</h6>`;
  });
  raw = raw.replace(/^#####\s+(.*$)/gim, (_, text) => {
    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    return `<h5 id="${id}" class="md-h5">${text}</h5>`;
  });
  raw = raw.replace(/^####\s+(.*$)/gim, (_, text) => {
    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    return `<h4 id="${id}" class="md-h4">${text}</h4>`;
  });
  raw = raw.replace(/^###\s+(.*$)/gim, (_, text) => {
    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    return `<h3 id="${id}" class="md-h3">${text}</h3>`;
  });
  raw = raw.replace(/^##\s+(.*$)/gim, (_, text) => {
    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    return `<h2 id="${id}" class="md-h2">${text}</h2>`;
  });
  raw = raw.replace(/^#\s+(.*$)/gim, (_, text) => {
    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    return `<h1 id="${id}" class="md-h1">${text}</h1>`;
  });

  // Bold & Italic
  raw = raw.replace(/\*\*\*([^*]+)\*\*\*/g, "<strong><em>$1</em></strong>");
  raw = raw.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  raw = raw.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  raw = raw.replace(/___([^_]+)___/g, "<strong><em>$1</em></strong>");
  raw = raw.replace(/__([^_]+)__/g, "<strong>$1</strong>");
  raw = raw.replace(/_([^_]+)_/g, "<em>$1</em>");

  // Blockquotes >
  raw = raw.replace(/^>\s+(.*$)/gim, '<blockquote class="md-blockquote">$1</blockquote>');

  // Horizontal Rule --- or ***
  raw = raw.replace(/^(---|[*]{3,})$/gim, '<hr class="md-hr" />');

  // Task Checkboxes - [ ] or - [x]
  let lineIdx = 0;
  const lines = raw.split("\n").map((line) => {
    const currentLineIdx = lineIdx++;
    if (/^\s*[-*]\s+\[\s*\]\s+(.*)/i.test(line)) {
      return line.replace(
        /^\s*[-*]\s+\[\s*\]\s+(.*)/i,
        `<div class="md-task-item"><input type="checkbox" data-lineindex="${currentLineIdx}" class="md-task-checkbox" /> <span>$1</span></div>`
      );
    }
    if (/^\s*[-*]\s+\[[xX]\]\s+(.*)/i.test(line)) {
      return line.replace(
        /^\s*[-*]\s+\[[xX]\]\s+(.*)/i,
        `<div class="md-task-item completed"><input type="checkbox" checked data-lineindex="${currentLineIdx}" class="md-task-checkbox" /> <span class="line-through">$1</span></div>`
      );
    }
    // Bullet list
    if (/^\s*[-*]\s+(.*)/.test(line)) {
      return line.replace(/^\s*[-*]\s+(.*)/, '<li class="md-bullet-item">$1</li>');
    }
    // Numbered list
    if (/^\s*\d+\.\s+(.*)/.test(line)) {
      return line.replace(/^\s*\d+\.\s+(.*)/, '<li class="md-number-item">$1</li>');
    }
    return line;
  });

  raw = lines.join("\n");

  // Wrap consecutive <li> tags in <ul>
  raw = raw.replace(/(<li class="md-bullet-item">[\s\S]*?<\/li>)+/gi, '<ul class="md-ul">$&</ul>');
  raw = raw.replace(/(<li class="md-number-item">[\s\S]*?<\/li>)+/gi, '<ol class="md-ol">$&</ol>');

  // Restore Inline Code
  inlineCodes.forEach((codeHtml, idx) => {
    raw = raw.replace(`___INLINE_CODE_${idx}___`, codeHtml);
  });

  // Restore Code Blocks
  codeBlocks.forEach((blockHtml, idx) => {
    raw = raw.replace(`___CODE_BLOCK_${idx}___`, blockHtml);
  });

  // Paragraph line breaks
  const paragraphs = raw.split(/\n{2,}/).map((p) => {
    if (
      p.startsWith("<h") ||
      p.startsWith("<pre") ||
      p.startsWith("<blockquote") ||
      p.startsWith("<ul") ||
      p.startsWith("<ol") ||
      p.startsWith("<hr") ||
      p.startsWith("<div")
    ) {
      return p;
    }
    return `<p class="md-p">${p.replace(/\n/g, "<br/>")}</p>`;
  });

  return paragraphs.join("\n\n");
}

export function MarkdownRenderer({
  content,
  onWikiLinkClick,
  onToggleCheckbox,
  className = "",
}: MarkdownRendererProps) {
  const htmlContent = parseMarkdownToHTML(content);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;

    // Check if wiki link clicked
    const wikiEl = target.closest(".md-wiki-link");
    if (wikiEl) {
      e.preventDefault();
      const wikiTitle = wikiEl.getAttribute("data-wikititle");
      if (wikiTitle && onWikiLinkClick) {
        onWikiLinkClick(decodeURIComponent(wikiTitle));
      }
      return;
    }

    // Check if task checkbox clicked
    if (target.classList.contains("md-task-checkbox")) {
      const checkbox = target as HTMLInputElement;
      const lineIdxStr = checkbox.getAttribute("data-lineindex");
      if (lineIdxStr !== null && onToggleCheckbox) {
        const lineIdx = parseInt(lineIdxStr, 10);
        onToggleCheckbox(lineIdx, checkbox.checked);
      }
    }
  };

  return (
    <div
      className={`markdown-renderer-body ${className}`}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
      onClick={handleClick}
    />
  );
}
