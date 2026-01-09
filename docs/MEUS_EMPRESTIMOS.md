# Tela de Meus Empréstimos - Painel do Usuário

## Estrutura Criada

Este documento descreve a implementação modularizada da tela de "Meus Empréstimos" para o painel do usuário.

## Arquivos Criados/Modificados

### 1. Componentes de Subpáginas

#### `src/pages/subpages/MeusEmprestimos.tsx`

- **Descrição**: Componente principal da tela de empréstimos do usuário
- **Funcionalidades**:
  - Exibe lista de empréstimos do usuário logado
  - Mostra estatísticas (total, ativos, atrasados, concluídos)
  - Utiliza a DataTable para apresentar os dados
  - Integra com a API para buscar empréstimos (`GET /emprestimos/meus`)
  - Feedback de loading e estados vazios

#### `src/pages/subpages/CatalogoLivros.tsx`

- **Descrição**: Componente para exibir o catálogo de livros
- **Funcionalidades**:
  - Listagem de livros disponíveis
  - Sistema de filtros para busca
  - Integra com a API para buscar livros

#### `src/pages/subpages/DashboardUsuario.tsx`

- **Descrição**: Dashboard inicial do usuário com ações rápidas
- **Funcionalidades**:
  - Cards de ações rápidas para navegação
  - Links para Catálogo e Empréstimos

### 2. Colunas da Tabela

#### `src/components/ui/columns/emprestimosColumn.tsx`

- **Descrição**: Definição das colunas para a tabela de empréstimos
- **Colunas**:
  - **ID**: Identificador do empréstimo
  - **Livros**: Lista de livros emprestados
  - **Data de Empréstimo**: Data de início com formatação
  - **Previsão Devolução**: Data prevista com contador de dias
  - **Data Devolução**: Data real de devolução (quando aplicável)
  - **Multa**: Valor da multa (se houver)
  - **Status**: Badge dinâmico com status do empréstimo
    - Ativo (verde)
    - Atrasado (vermelho)
    - Devolvido (cinza)
    - Devolvido com Atraso (vermelho)

### 3. Painel Principal Refatorado

#### `src/pages/paineis/Usuario.tsx`

- **Descrição**: Container principal com navegação e roteamento
- **Funcionalidades**:
  - Header fixo com menu de navegação
  - Roteamento entre subpáginas:
    - `/usuario/dashboard` - Dashboard inicial
    - `/usuario/livros` - Catálogo de livros
    - `/usuario/emprestimos` - Meus empréstimos
  - Redirecionamento automático para dashboard

### 4. Arquivos de Exportação

#### `src/pages/subpages/index.ts`

- Exporta todos os componentes de subpáginas

#### `src/components/ui/columns/index.ts`

- Exporta a coluna de empréstimos junto com as demais

## Dependências Instaladas

- **date-fns**: Biblioteca para manipulação e formatação de datas
  - Funções utilizadas: `format`, `differenceInDays`, `parseISO`
  - Locale: `ptBR` para formatação em português

## Integração com API

### Endpoint Esperado

```typescript
GET / emprestimos / meus;
```

**Resposta Esperada**:

```typescript
interface Emprestimo {
  id: number;
  usuarioId: number;
  livros: Livro[];
  dataInicio: string; // YYYY-MM-DD
  dataPrevistaDevolucao: string; // YYYY-MM-DD
  dataDevolucaoReal?: string; // YYYY-MM-DD
  multa?: number;
  usuario?: Usuario;
}
```

## Funcionalidades da Tela de Empréstimos

### Cards de Estatísticas

1. **Total de Empréstimos**: Contagem total de registros
2. **Empréstimos Ativos**: Empréstimos sem devolução
3. **Atrasados**: Empréstimos com data prevista vencida
4. **Concluídos**: Empréstimos já devolvidos

### Tabela de Empréstimos

- Ordenação e paginação via DataTable
- Badges de status com cores dinâmicas
- Formatação de datas em português
- Cálculo automático de dias de atraso/restantes
- Exibição de multas quando aplicável

### Lógica de Status

O status é calculado automaticamente baseado nas datas:

1. **Devolvido**: `dataDevolucaoReal` existe e está dentro do prazo
2. **Devolvido com Atraso**: `dataDevolucaoReal` existe e ultrapassou o prazo
3. **Atrasado**: Sem devolução e data prevista já passou
4. **Ativo**: Sem devolução e dentro do prazo
5. **Vence em X dias**: Sem devolução e faltam 3 dias ou menos

## Estrutura de Navegação

```
/usuario
  ├── /dashboard (Dashboard com ações rápidas)
  ├── /livros (Catálogo de livros)
  └── /emprestimos (Meus empréstimos)
```

## Estilos e Design

- Gradient de fundo: `from-blue-50 via-indigo-50 to-purple-50`
- Header fixo com backdrop blur
- Cards com hover effects e transições suaves
- Badges coloridos para status
- Responsive design com grid adaptativo
- Ícones do Lucide React

## Como Usar

1. O usuário acessa o painel em `/usuario`
2. É redirecionado automaticamente para `/usuario/dashboard`
3. Pode navegar entre as seções usando o menu superior
4. A tela de empréstimos mostra automaticamente os dados do usuário logado
5. Estatísticas são calculadas dinamicamente baseadas nos dados

## Melhorias Futuras Sugeridas

- [ ] Filtros para empréstimos (por status, data, etc.)
- [ ] Botão de renovação de empréstimo
- [ ] Modal com detalhes completos do empréstimo
- [ ] Exportação de histórico em PDF
- [ ] Notificações de empréstimos próximos ao vencimento
- [ ] Gráficos de histórico de empréstimos
