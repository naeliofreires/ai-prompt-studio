# Markdown Stream Rendering
> Output markdown rendering and stream consumption cleanup

Entry: `src/features/prompt-generation/ui/components/StreamingMarkdown/index.tsx:StreamingMarkdown()`

Markdown:
- `StreamingMarkdown()` stabilizes partial content via `src/features/prompt-generation/ui/markdown/stabilizeStreamingMarkdown.ts`
- `src/features/prompt-generation/ui/markdown/createMarkdownPlugins.ts` applies `remark-gfm` and `rehype-sanitize`
- Anchor renderer allow-lists `http:`, `https:`, `mailto:`, `tel:` and renders rejected hrefs as text
- `tel:` must be allowed in the rehype sanitize schema before the anchor renderer sees it

Tests:
- `test/streaming-markdown.test.tsx`
- `test/stabilize-streaming-markdown.test.ts`

Updated: 2026-06-09
