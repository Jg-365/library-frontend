# 📋 Guia de Integração com Backend

## 🎯 Arquitetura Refatorada

O projeto foi completamente refatorado seguindo os princípios de **separação de responsabilidades** e **centralização de configurações**. Agora está organizado e pronto para integração com o backend real.

---

## 📁 Estrutura Organizada

### **1. Configurações Centralizadas** (`src/config/`)

- ✅ `constants.ts` - Todas as constantes da aplicação em um único lugar

### **2. Schemas de Validação** (`src/schemas/`)

- ✅ `AutorSchema.tsx` - Validação de Autor (response + form)
- ✅ `BooksSchema.tsx` - Validação de Livro (response + form)
- ✅ `CategoriasSchema.tsx` - Validação de Categoria (response + form)
- ✅ `LoginSchema.tsx` - Validação de Login
- ✅ `index.ts` - Exportações centralizadas

### **3. Types e Interfaces** (`src/types/`)

- ✅ Todas as interfaces TypeScript organizadas
- ✅ Exportações centralizadas via `index.ts`

### **4. Rotas** (`src/routes/`)

- ✅ `index.tsx` - Router principal
- ✅ `privateRoutes.tsx` - Rotas protegidas por perfil
- ✅ `publicRoutes.tsx` - Rotas públicas

### **5. Serviços** (`src/services/`)

- ✅ `api.ts` - Cliente axios configurado
- ✅ `authService.ts` - Serviço de autenticação
- ✅ `mockAdapter.ts` - Mocks para desenvolvimento

---

## 🔧 Como Integrar com o Backend

### **Passo 1: Configurar URL da API**

Edite `src/config/constants.ts`:

```typescript
export const API_CONFIG = {
  // Comentar/remover esta linha (desenvolvimento com mocks)
  // BASE_URL: "/api",

  // Descomentar e configurar esta linha (produção)
  BASE_URL:
    process.env.VITE_API_URL || "http://localhost:8080/api",

  TIMEOUT: 10000,
  HEADERS: {
    "Content-Type": "application/json",
  },
};
```

### **Passo 2: Desabilitar os Mocks**

Edite `src/main.tsx`:

```typescript
// Comentar ou remover este bloco
/*
if (import.meta.env.DEV) {
  await import("./services/mockAdapter");
}
*/
```

### **Passo 3: Configurar Variável de Ambiente**

Crie/edite `.env` na raiz do projeto:

```env
VITE_API_URL=http://localhost:8080/api
```

**Pronto!** Sua aplicação agora vai fazer requisições para o backend real.

---

## 📍 Endpoints Configurados

Todos os endpoints estão centralizados em `src/config/constants.ts`:

```typescript
export const API_ENDPOINTS = {
  // Autenticação
  AUTH: {
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    REGISTER: "/auth/register",
    REFRESH: "/auth/refresh",
  },

  // Livros
  LIVROS: {
    BASE: "/livros",
    BY_ID: (id: number) => `/livros/${id}`,
    SEARCH: "/livros/search",
  },

  // Autores
  AUTORES: {
    BASE: "/autores",
    BY_ID: (id: number) => `/autores/${id}`,
  },

  // Categorias
  CATEGORIAS: {
    BASE: "/categorias",
    BY_ID: (id: number) => `/categorias/${id}`,
  },

  // Empréstimos
  EMPRESTIMOS: {
    BASE: "/emprestimos",
    BY_ID: (id: number) => `/emprestimos/${id}`,
    BY_USER: (userId: number) =>
      `/emprestimos/usuario/${userId}`,
    RENOVAR: (id: number) => `/emprestimos/${id}/renovar`,
    DEVOLVER: (id: number) => `/emprestimos/${id}/devolver`,
  },

  // Reservas
  RESERVAS: {
    BASE: "/reservas",
    BY_ID: (id: number) => `/reservas/${id}`,
    BY_USER: (userId: number) =>
      `/reservas/usuario/${userId}`,
    CANCELAR: (id: number) => `/reservas/${id}/cancelar`,
  },

  // Usuários
  USUARIOS: {
    BASE: "/usuarios",
    BY_ID: (id: number) => `/usuarios/${id}`,
    PROFILE: "/usuarios/profile",
  },
};
```

### 📑 Relatórios

No momento não existe um endpoint dedicado de relatórios no backend.
Os relatórios são gerados no frontend agregando dados reais dos seguintes endpoints:

- `GET /loans/users` (empréstimos)
- `GET /users/all` (apenas ADMIN/BIBLIOTECARIO) ou `GET /users/me` (usuário padrão)
- `GET /books` (acervo)
- `GET /reserves/users` (reservas)

Caso o backend venha a disponibilizar um endpoint dedicado (ex.: `GET /reports`),
atualize o `reportsService` e o `Relatorios.tsx` para consumir a rota diretamente.

---

## 🔑 Chaves do LocalStorage

Centralizadas em `src/config/constants.ts`:

```typescript
export const STORAGE_KEYS = {
  AUTH_TOKEN: "auth-token",
  USER_DATA: "user-data",
  THEME: "theme",
};
```

---

## 🛣️ Rotas por Perfil

Centralizadas em `src/config/constants.ts`:

```typescript
export const PERFIL_ROUTES = {
  ALUNO: "/usuario",
  PROFESSOR: "/usuario",
  BIBLIOTECARIO: "/bibliotecario/livros",
  ADMINISTRADOR: "/admin/livros",
};
```

---

## ✅ Benefícios da Refatoração

1. **Centralização** - Todas as configurações em um único lugar
2. **Manutenibilidade** - Fácil de alterar e manter
3. **Validação** - Schemas Zod para validação consistente
4. **Tipagem** - TypeScript em todos os níveis
5. **Separação** - Cada componente com sua responsabilidade
6. **Reutilização** - Components e hooks reutilizáveis
7. **Segurança** - Validação de dados em todas as camadas

---

## 🧪 Testando a Integração

### Com Mocks (Desenvolvimento)

```bash
npm run dev
```

### Com Backend Real

1. Siga os passos 1, 2 e 3 acima
2. Certifique-se que o backend está rodando
3. Execute:

```bash
npm run dev
```

---

## 📝 Contratos de API Esperados

### Login

**POST** `/auth/login`

```json
// Request
{
  "username": "string",
  "password": "string"
}

// Response
{
  "user": {
    "id": number,
    "nome": "string",
    "email": "string",
    "perfil": "ALUNO" | "PROFESSOR" | "BIBLIOTECARIO" | "ADMINISTRADOR"
  },
  "token": "string"
}
```

### Livros

**GET** `/livros`

```json
[
  {
    "id": number,
    "isbn": "string",
    "titulo": "string",
    "ano": number,
    "editora": "string",
    "categoriaId": number,
    "autores": [
      {
        "id": number,
        "nome": "string",
        "email": "string",
        "nacionalidade": "string"
      }
    ],
    "quantidadeExemplares": number
  }
]
```

---

## 🚀 Próximos Passos

- [ ] Configurar variável de ambiente VITE_API_URL
- [ ] Desabilitar mocks quando backend estiver pronto
- [ ] Testar todos os fluxos com backend real
- [ ] Ajustar contratos se necessário
- [ ] Implementar tratamento de erros específicos do backend
- [ ] Configurar CORS no backend

---

## 📞 Suporte

Se encontrar problemas na integração:

1. Verifique se o backend está rodando
2. Verifique a URL configurada em `.env`
3. Verifique os contratos de API
4. Verifique o console do navegador para erros
5. Verifique a aba Network para requisições

---

**Desenvolvido com ❤️ - Projeto organizado e pronto para integração!**
