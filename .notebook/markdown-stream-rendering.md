# Markdown Stream Rendering
> Output markdown rendering and stream consumption cleanup

Entry: `src/renderer/components/StreamingMarkdown/index.tsx:StreamingMarkdown()`

Markdown:
- `StreamingMarkdown()` stabilizes partial content via `src/renderer/markdown/stabilizeStreamingMarkdown.ts`
- `src/renderer/markdown/createMarkdownPlugins.ts` applies `remark-gfm` and `rehype-sanitize`
- Anchor renderer allow-lists `http:`, `https:`, `mailto:`, `tel:` and renders rejected hrefs as text
- `tel:` must be allowed in the rehype sanitize schema before the anchor renderer sees it

Streaming hook:
- `src/renderer/hooks/useStreamedMarkdown.ts:consume()` handles `ReadableStream` before async iterable detection
- Reader lock is released in `finally`
- Abort cleanup only clears streaming state when the finishing controller is still active

Tests:
- `test/streaming-markdown.test.tsx`
- `test/use-streamed-markdown.test.tsx`

Updated: 2026-06-09
