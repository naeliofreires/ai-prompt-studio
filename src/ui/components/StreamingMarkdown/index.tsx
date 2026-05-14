import { memo, useMemo } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import { rehypePlugins, remarkPlugins } from "../../markdown/createMarkdownPlugins";
import { stabilizeStreamingMarkdown } from "../../markdown/stabilizeStreamingMarkdown";
import styles from "./StreamingMarkdown.module.scss";

const linkRenderer: Components["a"] = ({ href, children, ...props }) => {
  if (href?.trim().toLowerCase().startsWith("javascript:")) {
    return <span>{children}</span>;
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
      {children}
    </a>
  );
};

export type StreamingMarkdownProps = {
  content: string;
  isStreaming?: boolean;
  className?: string;
  components?: Components;
};

export const StreamingMarkdown = memo(function StreamingMarkdown({
  content,
  isStreaming = false,
  className,
  components,
}: StreamingMarkdownProps) {
  const markdown = useMemo(
    () => stabilizeStreamingMarkdown(content, isStreaming),
    [content, isStreaming],
  );

  return (
    <div className={[styles.markdownStream, className].filter(Boolean).join(" ")}>
      <ReactMarkdown
        remarkPlugins={remarkPlugins}
        rehypePlugins={rehypePlugins}
        components={{ a: linkRenderer, ...components }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
});
