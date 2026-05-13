# PRD: AI Prompt Studio (Desktop Mac)

## 1. Visão Geral

Um aplicativo desktop para macOS focado em transformar ideias brutas em prompts de alta performance, utilizando personas especializadas e suporte a múltiplos modelos de linguagem (LLMs). O objetivo é centralizar a criação, refinamento e gestão de prompts em um fluxo de trabalho profissional.

## 2. Objetivos Principais

- **Especialização:** Fornecer contextos predefinidos para diferentes áreas técnicas.
- **Qualidade:** Implementar um sistema de feedback quantitativo e qualitativo para cada prompt.
- **Flexibilidade:** Permitir a troca rápida entre diferentes provedores de IA.
- **Agilidade:** Facilitar a reutilização de prompts através de históricos e favoritos.

## 3. Stack Tecnológica

- **Framework:** Electron (para suporte cross-platform futuro).
- **Frontend:** React.js.
- **Arquitetura:** Baseada em módulos (Modular Architecture).
- **Design Pattern:** Adapter Pattern (para integração com múltiplas APIs de LLM).

## 4. Requisitos Funcionais

### 4.1. Core: Sistema de Personas (Tabs)

O app deve possuir abas específicas que injetam contextos de especialistas automaticamente:

- **Frontend Expert:** Foco em React, Next.js, HTML/CSS e performance.
- **Backend Expert:** Foco em arquitetura, segurança e APIs.
- **UI/UX Expert:** Foco em acessibilidade, usabilidade e design systems.
- **General:** Para prompts diversos.

### 4.2. Gestão de Prompts

- **Transformação:** Campo de input para texto bruto e output para o prompt refinado.
- **Copy-to-Clipboard:** Botão de um clique para copiar o resultado.
- **Favoritos:** Sistema para marcar e organizar prompts recorrentes.
- **Histórico:** Log local de todas as transformações realizadas.

### 4.3. Inteligência e Avaliação

- **Múltiplas LLMs:** Suporte para API do Gemini, Codex, entre outros.
- **Rating System:** Uma IA secundária deve avaliar o prompt gerado com uma nota de **0 a 5**.
- **Feedback Qualitativo:** Além da nota, o sistema deve sugerir melhorias específicas para o prompt.

## 5. Arquitetura de Software (Módulos)

| Módulo | Responsabilidade |
| --- | --- |
| **LLM Adapter** | Interface comum para lidar com diferentes APIs (Gemini, Codex, etc). |
| **Prompt Engine** | Lógica de transformação baseada nas personas (Tabs). |
| **Storage Module** | Persistência local de históricos e favoritos. |
| **Evaluator** | Lógica de integração com a IA de avaliação e scoring. |
| **UI Components** | Componentes React modulares (Tabs, Cards, Inputs). |

## 6. Fluxo do Usuário

1. O usuário seleciona a **Aba de Especialidade** (ex: Frontend).
2. Insere a ideia ou rascunho no campo de entrada.
3. O sistema processa o texto através da **LLM selecionada** via Adapter.
4. O prompt final é exibido junto com uma **nota de 0 a 5** e sugestões de ajuste.
5. O usuário pode **copiar**, **favoritar** ou consultar o **histórico** para versões anteriores.

## 7. Próximos Passos (Fase 1)

- [ ] Setup do ambiente Electron + React.
- [ ] Implementação do Adapter Pattern para a primeira LLM.
- [ ] Criação da interface baseada em Tabs (Especialidades).
- [ ] Desenvolvimento do sistema de Storage local para Histórico.
