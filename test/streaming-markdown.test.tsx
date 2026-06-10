import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StreamingMarkdown } from "../apps/promptizer/ui/components/StreamingMarkdown";

describe("StreamingMarkdown", () => {
  it("renders headings and lists from markdown", () => {
    render(
      <StreamingMarkdown
        content={"# Heading\n\n- first\n- second"}
        isStreaming={false}
      />,
    );

    expect(screen.getByRole("heading", { level: 1, name: "Heading" })).toBeInTheDocument();
    expect(screen.getByText("first")).toBeInTheDocument();
    expect(screen.getByText("second")).toBeInTheDocument();
  });

  it("does not render script tags from markdown input", () => {
    const { container } = render(
      <StreamingMarkdown content={'<script>alert("xss")</script>\n\nSafe text'} />,
    );

    expect(container.querySelector("script")).toBeNull();
    expect(screen.getByText("Safe text")).toBeInTheDocument();
  });

  it("does not render javascript links as anchors", () => {
    render(<StreamingMarkdown content={'[click me](javascript:alert(1))'} />);

    expect(screen.queryByRole("link", { name: "click me" })).toBeNull();
    expect(screen.getByText("click me")).toBeInTheDocument();
  });

  it.each([
    ["javascript", "[unsafe](javascript:alert(1))"],
    ["data", "[unsafe](data:text/html;base64,PGgxPkhlbGxvPC9oMT4=)"],
    ["vbscript", "[unsafe](vbscript:msgbox(1))"],
    ["malformed", "[unsafe](http://[::1)"],
  ])("does not render %s hrefs as anchors", (_protocol, content) => {
    render(<StreamingMarkdown content={content} />);

    expect(screen.queryByRole("link", { name: "unsafe" })).toBeNull();
    expect(screen.getByText("unsafe")).toBeInTheDocument();
  });

  it.each([
    ["https", "[safe](https://example.com/docs)"],
    ["http", "[safe](http://example.com/docs)"],
    ["mailto", "[safe](mailto:hello@example.com)"],
    ["tel", "[safe](tel:+15555550100)"],
  ])("renders %s hrefs as anchors", (_protocol, content) => {
    render(<StreamingMarkdown content={content} />);

    expect(screen.getByRole("link", { name: "safe" })).toBeInTheDocument();
  });

  it("does not allow custom components to override safe link rendering", () => {
    render(
      <StreamingMarkdown
        content="[safe](https://example.com)"
        components={{
          a: ({ children }) => <button type="button">{children}</button>,
        }}
      />,
    );

    expect(screen.queryByRole("button", { name: "safe" })).toBeNull();
    expect(screen.getByRole("link", { name: "safe" })).toBeInTheDocument();
  });

  it("repairs an open fence only while streaming", () => {
    const source = "```ts\nconst value = 1";

    render(<StreamingMarkdown content={source} isStreaming />);

    expect(screen.getByText("const value = 1")).toBeInTheDocument();
    expect(source).toBe("```ts\nconst value = 1");
  });
});
