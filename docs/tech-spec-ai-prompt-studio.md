# Tech Spec: AI Prompt Studio

## 1. Objetivo

Definir a arquitetura técnica, os módulos, os contratos principais e o plano de implementação do aplicativo desktop **AI Prompt Studio**, alinhado ao PRD do produto.

## 2. Escopo da Fase 1

Incluído na Fase 1:

- Aplicativo desktop para macOS com Electron + React.
- Interface de configuração de refinamento.
- Transformação de texto bruto em prompt refinado.
- Integração inicial com uma LLM principal via Adapter.
- Avaliação do prompt com nota de 0 a 5 e feedback textual.

Fora do escopo da Fase 1:

- Sincronização em nuvem.
- Colaboração multiusuário.
- Marketplace de configurações prontas.
- Telemetria avançada e analytics.
- Suporte completo multi-plataforma com empacotamento para Windows/Linux.

## 3. Requisitos Técnicos

- O app deve iniciar localmente em macOS com arquitetura Electron.
- A UI deve ser desacoplada da lógica de integração com LLMs.
- A troca entre provedores de IA deve ocorrer sem alterar a camada de interface.
- O sistema de avaliação deve produzir nota estruturada e recomendações legíveis.
- O design deve suportar expansão futura para novos provedores, configurações e fluxos.

## 4. Arquitetura Proposta

### 4.1. Visão em camadas

1. **Presentation Layer**
   Responsável pela UI em React, gerenciamento de estado da tela e interação do usuário.
2. **Application Layer**
   Orquestra os casos de uso: transformar prompt e avaliar resultado.
3. **Domain Layer**
   Centraliza entidades, contratos e regras de negócio.
4. **Infrastructure Layer**
   Implementa adapters de LLM, persistência local e integração com APIs externas.

### 4.2. Módulos principais

- **UI Components**
  Componentes React para tabs, seletor de modelo, editor de entrada, painel de saída e rating.
- **Prompt Engine**
  Monta o prompt final combinando instruções de refinamento, texto do usuário e metadados de execução.
- **LLM Adapter**
  Expõe uma interface única para múltiplos provedores.
- **Evaluator**
  Reutiliza um adapter de LLM ou um provider dedicado para gerar score e feedback.
- **IPC Layer**
  Faz a ponte segura entre renderer process e main process do Electron.

## 5. Stack e decisões

- **Desktop shell:** Electron
- **UI:** React + TypeScript
- **Build tool:** Vite
- **State management:** Zustand ou Context + hooks, priorizando simplicidade na Fase 1
- **Estilo:** CSS Modules ou Tailwind, a decidir no setup inicial
- **Persistência local:** SQLite ou JSON local via `electron-store`
- **Validação:** Zod para contratos entre camadas
- **Testes:** Vitest + React Testing Library

Decisão recomendada para Fase 1:

- Usar **TypeScript** em todo o projeto.
- Usar **electron-store** para acelerar a persistência inicial.
- Usar **Zustand** para estado global leve.

## 6. Estrutura sugerida de pastas

```text
src/
  main/
    ipc/
    services/
    storage/
    index.ts
  renderer/
    app/
    components/
    features/
      refinement-config/
      prompt-editor/
      evaluation/
    hooks/
    store/
    styles/
    main.tsx
  shared/
    contracts/
    domain/
    types/
    utils/
```

## 7. Entidades de domínio

### 7.1. Configuração de refinamento

```ts
interface RefinementConfig {
  instructions?: string;
}
```

### 7.2. LLM Provider

```ts
type ProviderId = "gemini" | "codex";

interface LlmProviderOption {
  id: ProviderId;
  label: string;
  model: string;
  enabled: boolean;
}
```

### 7.3. Prompt Session

```ts
interface PromptSession {
  id: string;
  rawInput: string;
  refinementConfig?: RefinementConfig;
  providerId: ProviderId;
  model: string;
  generatedPrompt: string;
  rating?: number;
  feedback?: string[];
  createdAt: string;
}
```

## 8. Contratos de módulo

### 8.1. LLM Adapter

```ts
interface GeneratePromptInput {
  refinementInstructions?: string;
  rawInput: string;
}

interface GeneratePromptOutput {
  prompt: string;
  tokensUsed?: number;
}

interface LlmAdapter {
  generatePrompt(input: GeneratePromptInput): Promise<GeneratePromptOutput>;
}
```

### 8.2. Evaluator

```ts
interface PromptEvaluation {
  score: number;
  suggestions: string[];
  summary: string;
}
```

## 9. Fluxos técnicos

### 9.1. Geração de prompt

1. UI coleta a configuração de refinamento, `provider` e `rawInput`.
2. Renderer envia comando via IPC ao processo principal.
3. Application service chama `PromptEngine`.
4. `PromptEngine` monta as instruções de refinamento.
5. `LlmAdapter` do provider selecionado gera o prompt refinado.
6. `Evaluator` executa a análise do prompt gerado.
7. UI renderiza prompt, score e feedback.

## 10. IPC e segurança

- Desabilitar `nodeIntegration` no renderer.
- Habilitar `contextIsolation`.
- Expor somente APIs explícitas via `preload`.
- Nunca armazenar chaves de API em componentes React.
- Chaves de API devem ser lidas de configuração local segura ou `.env` no processo principal.
- Validar payloads de IPC com schemas Zod.

Exemplo de surface mínima no preload:

```ts
window.aiPromptStudio = {
  generatePrompt: (payload) => ipcRenderer.invoke("prompt:generate", payload)
};
```

## 11. Estratégia de persistência

### Opção recomendada para Fase 1

Usar `electron-store` com versionamento simples de schema, suficiente para preferências básicas, como últimas instruções e último provider selecionado (quando essa camada for introduzida).

### Evolução futura

Migrar para SQLite quando houver necessidade de:

- filtros mais avançados;
- grande volume de dados locais;
- métricas locais e consultas compostas.

## 12. Estratégia de providers

Cada provider deve implementar a interface `LlmAdapter`, isolando:

- autenticação;
- endpoint;
- formato de request;
- formato de response;
- tratamento de erro;
- limites e retry.

Exemplo:

```ts
class GeminiAdapter implements LlmAdapter {
  async generatePrompt(input: GeneratePromptInput): Promise<GeneratePromptOutput> {
    return { prompt: "..." };
  }
}
```

## 13. Estratégia de avaliação

O evaluator deve usar um prompt estruturado para retornar JSON consistente:

```json
{
  "score": 4,
  "summary": "Prompt claro e específico.",
  "suggestions": [
    "Adicionar contexto de saída esperado",
    "Especificar restrições técnicas"
  ]
}
```

Regras:

- `score` deve ser normalizado entre 0 e 5;
- se a resposta vier inválida, aplicar fallback com parsing resiliente;
- registrar falhas sem bloquear a exibição do prompt principal.

## 14. UX funcional

- Controles de configuração de refinamento próximos ao editor.
- Seletor de provider/modelo próximo ao input.
- Área de entrada com suporte a texto livre.
- Área de saída com destaque visual e botão de copiar.
- Card de avaliação com score e sugestões.
- Loading state durante geração e avaliação.
- Mensagens de erro claras para indisponibilidade de provider ou chave ausente.

## 15. Observabilidade e erros

- Logar erros técnicos apenas no processo principal.
- Expor mensagens amigáveis na interface.
- Categorias mínimas:
  - erro de autenticação;
  - erro de rede;
  - timeout do provider;
  - erro de parsing da avaliação;
  - erro de persistência local.

## 16. Testes

### Unitários

- Prompt Engine monta corretamente as instruções de refinamento.
- Adapters respeitam a interface comum.
- Evaluator normaliza score e parsing.

### Integração

- Fluxo completo de geração com provider mockado.
- IPC entre renderer e main com payload válido.

### UI

- Alterar a configuração atualiza as instruções enviadas.
- Botão de copiar funciona.

## 17. Roadmap de implementação

### Sprint 1

- Setup Electron + React + TypeScript + Vite.
- Configuração de IPC seguro.
- Estrutura base de módulos e pastas.
- Configuração de refinamento e editor principal.

### Sprint 2

- Implementação do primeiro adapter de LLM.
- Prompt Engine com instruções configuráveis.
- Fluxo de geração fim a fim.

### Sprint 3

- Evaluator com score e sugestões.
- Estados de erro e loading.

### Sprint 4

- Testes principais.
- Refino de UX.
- Preparação para empacotamento macOS.

## 18. Riscos e mitigação

- **Mudança de contrato de APIs externas**
  Mitigação: centralizar integrações em adapters isolados.
- **Resposta inconsistente da IA avaliadora**
  Mitigação: schema validation + fallback parser.
- **Exposição de segredo no renderer**
  Mitigação: manter chamadas externas no main process.
- **Crescimento rápido de escopo**
  Mitigação: limitar a Fase 1 ao fluxo principal e persistência local simples.

## 19. Critérios de aceite da Fase 1

- Usuário consegue configurar instruções e selecionar um provider.
- Usuário consegue inserir uma ideia e gerar um prompt refinado.
- Sistema exibe nota de 0 a 5 e sugestões de melhoria.
- Usuário consegue copiar o prompt final.
- Arquitetura permite adicionar um novo provider sem alterar a UI principal.

## 20. Assunções

- A primeira versão será executada localmente em macOS.
- O usuário fornecerá suas próprias chaves de API dos providers suportados.
- A avaliação poderá usar o mesmo provider da geração na Fase 1, se necessário.
