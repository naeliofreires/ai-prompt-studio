export function stabilizeStreamingMarkdown(source: string, isStreaming: boolean): string {
  if (!isStreaming || !source) {
    return source;
  }

  const fenceCount = (source.match(/^```(?!`)/gm) ?? []).length;
  return fenceCount % 2 === 1 ? `${source}\n\`\`\`` : source;
}
