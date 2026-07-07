# Promptizer Context

Promptizer refines prompts through named personas and provider-backed generation. This context keeps product vocabulary stable for architecture reviews and implementation work.

## Language

**Persona**:
A reusable role and instruction profile that shapes how Promptizer refines a prompt.
_Avoid_: Agent, assistant, preset

**Custom Persona**:
A user-created Persona stored locally in browser/demo mode or through the desktop runtime.
_Avoid_: User role, profile

**Seed Persona**:
A built-in Persona created once when no Custom Persona has been stored yet.
_Avoid_: Default role, starter profile

**Provider**:
An external model vendor or compatible runtime used by Promptizer to generate refined prompts.
_Avoid_: Model backend, LLM service

**Prompt Studio**:
The main workspace where a user selects a Persona and Provider, writes the source prompt, attaches context, and receives the refined prompt.
_Avoid_: Editor, playground, workspace
