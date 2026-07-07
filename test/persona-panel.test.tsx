import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PersonaPanel } from "../apps/promptizer/ui/components/PersonaPanel";
import type { Role } from "../apps/promptizer/ui/types/role";

const longDescription =
  "A focused role for deeply technical prompt refinement, with a long description that exercises the inline editor and accessibility attributes for layout stability.";

const roles: Role[] = [
  {
    id: "strategist",
    title: "Strategist",
    description: longDescription,
    source: "builtin",
  },
];

describe("PersonaPanel", () => {
  it("selects a persona and exposes custom persona management", async () => {
    const onSelect = vi.fn();
    const onManagePersonas = vi.fn();

    render(
      <PersonaPanel
        roles={roles}
        activeRole="other-role"
        isLoading={false}
        loadError=""
        actionError=""
        onSelect={onSelect}
        onManagePersonas={onManagePersonas}
      />,
    );

    const personaButton = screen.getByRole("button", { name: /strategist/i });
    expect(personaButton.getAttribute("aria-pressed")).toBe("false");

    fireEvent.click(personaButton);

    expect(onSelect).toHaveBeenCalledWith("strategist");

    fireEvent.click(screen.getByRole("button", { name: /personas/i }));
    expect(onManagePersonas).toHaveBeenCalledTimes(1);
  });
});
