import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StreamingMarkdown } from "../src/ui/components/StreamingMarkdown";

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

  it("repairs an open fence only while streaming", () => {
    const source = "```ts\nconst value = 1";

    render(<StreamingMarkdown content={source} isStreaming />);

    expect(screen.getByText("const value = 1")).toBeInTheDocument();
    expect(source).toBe("```ts\nconst value = 1");
  });
});
