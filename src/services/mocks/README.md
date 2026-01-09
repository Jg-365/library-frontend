# Mock Structure

Esta pasta contém todos os mocks estruturados e modularizados do projeto.

## Estrutura de Pastas

```
mocks/
├── data/               # Dados mockados
│   ├── users.mock.ts
│   ├── books.mock.ts
│   ├── emprestimos.mock.ts
│   ├── autores.mock.ts
│   ├── categorias.mock.ts
│   └── index.ts
├── handlers/           # Configuração de endpoints
│   ├── auth.handlers.ts
│   ├── books.handlers.ts
│   ├── emprestimos.handlers.ts
│   ├── autores.handlers.ts
│   ├── categorias.handlers.ts
│   └── index.ts
└── README.md
```

## Como Funciona

### 1. Data (Dados Mockados)

Os arquivos em `data/` contêm apenas os dados mockados:

- **users.mock.ts**: Usuários do sistema com credenciais
- **books.mock.ts**: Catálogo de livros
- **emprestimos.mock.ts**: Empréstimos de livros
- **autores.mock.ts**: Lista de autores
- **categorias.mock.ts**: Categorias de livros

### 2. Handlers (Configuração de Endpoints)

Os arquivos em `handlers/` configuram os endpoints da API mock:

- Cada handler é responsável por um recurso específico
- Implementa operações CRUD completas
- Valida dados quando necessário
- Retorna respostas HTTP apropriadas

### 3. MockAdapter (Orquestrador)

O arquivo `mockAdapter.ts` na raiz de `services/`:

- Importa todos os handlers
- Inicializa o MockAdapter
- Registra todos os endpoints
- Simula latência de rede (800ms)

## Adicionar Novos Mocks

### 1. Criar arquivo de dados

```typescript
// mocks/data/novo-recurso.mock.ts
export const mockNovoRecurso = [{ id: 1, nome: "Exemplo" }];
```

### 2. Criar handler

```typescript
// mocks/handlers/novo-recurso.handlers.ts
import type MockAdapter from "axios-mock-adapter";
import { mockNovoRecurso } from "../data";

export function setupNovoRecursoHandlers(
  mock: MockAdapter
) {
  mock.onGet("/novo-recurso").reply(200, mockNovoRecurso);
  // Adicionar outros endpoints...
}
```

### 3. Registrar no mockAdapter

```typescript
// mockAdapter.ts
import { setupNovoRecursoHandlers } from "./mocks/handlers";

setupNovoRecursoHandlers(mock);
```

## Vantagens desta Estrutura

1. **Modularização**: Cada recurso em seu próprio arquivo
2. **Manutenibilidade**: Fácil localizar e modificar dados
3. **Reutilização**: Dados podem ser importados onde necessário
4. **Escalabilidade**: Adicionar novos recursos é simples
5. **Organização**: Separação clara entre dados e lógica
6. **Testabilidade**: Fácil criar testes unitários para handlers

## Desabilitar Mocks

Para desabilitar os mocks e usar API real:

1. Comente a importação em `api.ts`
2. Ou remova `import "./mockAdapter"` do arquivo de inicialização
