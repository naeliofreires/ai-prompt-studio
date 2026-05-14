import { memo, useMemo } from "react";
import ReactMarkdown, { defaultUrlTransform, type Components } from "react-markdown";
import { rehypePlugins, remarkPlugins } from "../../markdown/createMarkdownPlugins";
import { stabilizeStreamingMarkdown } from "../../markdown/stabilizeStreamingMarkdown";
import styles from "./StreamingMarkdown.module.scss";

const ALLOWED_LINK_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"]);

const linkRenderer: Components["a"] = ({ href, children, ...props }) => {
  if (!href?.trim()) {
    return <span>{children}</span>;
  }

  let safeUrl: URL;

  try {
    safeUrl = new URL(href, window.location.origin);
  } catch {
    return <span>{children}</span>;
  }

  if (!ALLOWED_LINK_PROTOCOLS.has(safeUrl.protocol)) {
    return <span>{children}</span>;
  }

  return (
    <a {...props} href={safeUrl.href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
};

function urlTransform(value: string, key: string) {
  if (key === "href") {
    return value;
  }

  return defaultUrlTransform(value);
}

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
        urlTransform={urlTransform}
        components={{ ...components, a: linkRenderer }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
});
