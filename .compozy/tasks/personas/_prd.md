# Personas Page PRD

## Overview

Promptizer needs a dedicated Personas page where users can view, create, edit, and delete the personas used during prompt generation. A persona has a title and description. The description defines the behavioral context attached to the generation prompt when the user clicks Generate.

This feature is for users who rely on different prompt-generation styles and want more predictable outputs. Today, persona management exists through modal-driven flows, which makes the capability less visible and harder to manage as a core part of the generation workflow. A dedicated page inside Promptizer makes personas easier to understand, maintain, and intentionally apply.

The MVP starts with two personas. Both initial personas are editable and deletable. If no persona is available or selected, Generate is blocked until the user creates or selects one.

## Goals

- Give users one clear place inside Promptizer to manage personas.
- Let users create, edit, and delete personas with only a title and description.
- Make the active persona’s description clearly influence Generate results.
- Prevent generation when no persona is available, avoiding unclear or inconsistent behavior.
- Keep the MVP focused on persona management and generation consistency.

## User Stories

- As a Promptizer user, I want to see all existing personas so that I can choose the right behavior before generating.
- As a Promptizer user, I want to create a persona with a title and description so that future generations follow a specific style or role.
- As a Promptizer user, I want to edit a persona so that I can improve the generated prompt behavior over time.
- As a Promptizer user, I want to delete personas I no longer use so that my list stays focused.
- As a Promptizer user, I want Generate to warn me when no persona is available so that I know what action is required.

## Core Features

### Dedicated Personas Page

A Personas page is available inside Promptizer. It shows the existing personas and provides the primary management actions. The page should make personas feel like a first-class part of the generation workflow rather than a hidden configuration.

### Persona List

The page lists all personas available to the user. Each item shows the persona title and description. The list should make it clear which persona is currently selected for generation.

### Create Persona

Users can create a new persona by entering a title and description. The description should guide users to describe how the persona should shape generated prompts.

### Edit Persona

Users can edit the title and description of any persona, including the two initial personas.

### Delete Persona

Users can delete any persona, including the two initial personas. If deleting the active persona leaves no available persona, Generate becomes blocked until the user creates a new persona.

### Generate Guardrail

Generate requires an available selected persona. If none exists or none can be selected, the app blocks generation and shows clear guidance to create or select a persona.

## User Experience

1. The user opens Promptizer.
2. The user navigates to the Personas page.
3. The user sees two initial personas.
4. The user can create a new persona, edit an existing one, or delete an unwanted one.
5. The user selects or confirms the persona they want to use.
6. The user returns to prompt generation and clicks Generate.
7. The selected persona description is applied to the generation behavior.
8. If no persona exists, Generate is blocked and the user sees a clear empty-state action to create a persona.

UX considerations:

- The page should explain that the description affects Generate behavior.
- Empty states should be actionable, not dead ends.
- Destructive delete actions should be clear enough to avoid accidental loss.
- The selected persona should be visible before generation.
- The form should stay simple: title and description only.

## High-Level Technical Constraints

- The feature must live inside Promptizer.
- The persona description must be attached to the generation behavior when Generate is clicked.
- Generate must not proceed when there is no available selected persona.
- The MVP must keep persona fields limited to title and description.

## Non-Goals

- No persona testing sandbox or preview mode in MVP.
- No persona cloning or preset marketplace in MVP.
- No separate instructions field beyond description.
- No persona sharing, publishing, or collaboration.
- No version history for persona edits.
- No advanced persona attributes such as tone, output format, tools, or examples.

## Phased Rollout Plan

### MVP Phase 1

- Add a dedicated Personas page inside Promptizer.
- Show two initial personas.
- Allow creating, editing, and deleting personas.
- Apply the selected persona description to Generate.
- Block Generate when no persona is available.

Success criteria:

- A user can complete create, edit, delete, select, and generate flows without leaving Promptizer.
- Generated output changes in a noticeable way based on the selected persona description.
- Empty persona state guides the user to create a persona before generating.

### Phase 2

- Add persona duplication or “start from existing persona.”
- Add stronger guidance examples for writing useful persona descriptions.
- Consider a lightweight confirmation or recovery path after deletion.

Success criteria:

- Users create higher-quality personas faster.
- Users recover from mistakes without support.

### Phase 3

- Consider persona testing, versioning, or sharing if users need higher confidence and reuse.

Success criteria:

- Users can validate persona behavior before relying on it for important generation tasks.

## Success Metrics

- Users can create a persona in under one minute.
- Users can find and edit an existing persona without needing external help.
- Generate is blocked with clear guidance when no persona exists.
- Users report or demonstrate more consistent generated prompts after selecting personas.
- Fewer failed or confusing generations caused by missing persona context.

## Risks and Mitigations

- Risk: Users may not understand that description controls generation behavior. Mitigation: Add helper text near the description field and selected persona state.
- Risk: Users may delete all personas and feel stuck. Mitigation: Use an empty state with a clear Create Persona action and block Generate with specific guidance.
- Risk: Short or vague descriptions may produce inconsistent outputs. Mitigation: Encourage specific descriptions with concise examples or placeholder text.
- Risk: Users may expect personas to affect the entire app. Mitigation: State that personas affect Generate behavior inside Promptizer.

## Architecture Decision Records

- [ADR-001: Dedicated Personas Page MVP](adrs/adr-001.md) — Use a simple dedicated Personas page inside Promptizer with editable and deletable personas, title and description fields only, and Generate blocked when no persona is available.

## Open Questions

- What should the two initial personas be named and described as?
- Should deletion require confirmation in MVP?
