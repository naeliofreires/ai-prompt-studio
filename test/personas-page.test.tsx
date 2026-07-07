import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PersonasPage } from "../apps/promptizer/ui/components/PersonasPage";
import type { Role } from "../apps/promptizer/ui/types/role";

const personas: Role[] = [
  {
    id: "frontend-specialist",
    title: "Frontend Specialist",
    description: "Refines prompts for React and TypeScript.",
    source: "custom",
  },
  {
    id: "backend-specialist",
    title: "Backend Specialist",
    description: "Refines prompts for APIs and databases.",
    source: "custom",
  },
];

function renderPage(overrides: Partial<React.ComponentProps<typeof PersonasPage>> = {}) {
  const props: React.ComponentProps<typeof PersonasPage> = {
    roles: personas,
    activeRole: personas[0].id,
    isLoading: false,
    loadError: "",
    actionError: "",
    onSelect: vi.fn(),
    onCreate: vi.fn().mockResolvedValue(undefined),
    onUpdate: vi.fn().mockResolvedValue(undefined),
    onDelete: vi.fn().mockResolvedValue(true),
    ...overrides,
  };

  return {
    ...render(<PersonasPage {...props} />),
    props,
  };
}

describe("PersonasPage", () => {
  it("renders personas and the selected state", () => {
    renderPage();

    expect(screen.getByRole("heading", { name: "Personas" })).toBeInTheDocument();
    expect(screen.getAllByText("Frontend Specialist")).not.toHaveLength(0);
    expect(screen.getAllByText("Refines prompts for React and TypeScript.")).not.toHaveLength(0);
    expect(screen.getByText("Selected for generation")).toBeInTheDocument();
  });

  it("rejects blank persona fields and trims values before create", async () => {
    const { props } = renderPage();

    fireEvent.change(screen.getByPlaceholderText("Frontend Specialist"), {
      target: { value: "   " },
    });
    fireEvent.change(screen.getByPlaceholderText("Describe how this persona should influence prompts."), {
      target: { value: "   " },
    });
    fireEvent.click(screen.getByRole("button", { name: /create/i }));

    expect(props.onCreate).not.toHaveBeenCalled();
    expect(await screen.findAllByText("Title is required.")).toHaveLength(1);
    expect(screen.getByText("Description is required.")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("Frontend Specialist"), {
      target: { value: "  Accessibility Lead  " },
    });
    fireEvent.change(screen.getByPlaceholderText("Describe how this persona should influence prompts."), {
      target: { value: "  Prioritize clear, accessible UI output.  " },
    });
    fireEvent.click(screen.getByRole("button", { name: /create/i }));

    expect(props.onCreate).toHaveBeenCalledWith(
      "Accessibility Lead",
      "Prioritize clear, accessible UI output.",
    );
  });

  it("trims values before saving an edit", () => {
    const { props } = renderPage();

    fireEvent.click(screen.getAllByRole("button", { name: /edit/i })[0]);
    fireEvent.change(screen.getByDisplayValue("Frontend Specialist"), {
      target: { value: "  Frontend Lead  " },
    });
    fireEvent.change(screen.getByDisplayValue("Refines prompts for React and TypeScript."), {
      target: { value: "  Tighten React and TypeScript prompts.  " },
    });
    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    expect(props.onUpdate).toHaveBeenCalledWith("frontend-specialist", {
      title: "Frontend Lead",
      description: "Tighten React and TypeScript prompts.",
    });
  });

  it("requires confirmation before deleting a persona", () => {
    const { props } = renderPage();

    const firstDeleteButton = screen.getAllByRole("button", { name: /delete/i })[0];
    const firstCard = firstDeleteButton.closest("article") as HTMLElement;
    fireEvent.click(firstDeleteButton);

    expect(props.onDelete).not.toHaveBeenCalled();
    expect(screen.getByText("Delete this persona?")).toBeInTheDocument();

    fireEvent.click(within(firstCard).getByRole("button", { name: /^Delete$/i }));
    expect(props.onDelete).toHaveBeenCalledWith("frontend-specialist");
  });

  it("shows an actionable empty state when no personas exist", () => {
    renderPage({ roles: [] });

    expect(screen.getByText("No personas yet")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create your first persona/i })).toBeInTheDocument();
  });
});
