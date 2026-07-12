# Promptizer Context

Promptizer refines prompts through configurable instructions and provider-backed generation. This context keeps product vocabulary stable for architecture reviews and implementation work.

## Language

**Configuração de refinamento**:
Instruções e opções selecionadas para orientar como Promptizer refina um prompt.

**Provider**:
An external model vendor or compatible runtime used by Promptizer to generate refined prompts.
_Avoid_: Model backend, LLM service

**Prompt Studio**:
The main workspace where a user configures a Provider, writes the source prompt, attaches context, and receives the refined prompt.
_Avoid_: Editor, playground, workspace
