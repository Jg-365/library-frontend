/**
 * Configurações de ambiente e API
 */

// URL base da API - altere aqui para integrar com o backend
const RAW_API_BASE_URL = import.meta.env.VITE_API_URL;
const NORMALIZED_API_BASE_URL = RAW_API_BASE_URL
  ? RAW_API_BASE_URL.match(/^https?:\/\//)
    ? RAW_API_BASE_URL
    : `https://${RAW_API_BASE_URL}`
  : "https://trabalhobd-20252-equipe-552419-production.up.railway.app/library";

const ensureLibraryBasePath = (baseUrl: string) => {
  const sanitized = baseUrl.replace(/\/+$/, "");
  return sanitized.endsWith("/library")
    ? sanitized
    : `${sanitized}/library`;
};

export const API_CONFIG = {
  // Em dev usa proxy do Vite (vite.config.ts), em produção use variável de ambiente VITE_API_URL
  BASE_URL: ensureLibraryBasePath(NORMALIZED_API_BASE_URL),

  TIMEOUT: 10000,

  // Headers padrão
  HEADERS: {
    "Content-Type": "application/json",
  },
} as const;

/**
 * Endpoints da API - centralizados para fácil manutenção
 */
export const API_ENDPOINTS = {
  // Autenticação
  AUTH: {
    LOGIN: "/auth/login",
  },

  // Livros (Books)
  LIVROS: {
    BASE: "/books",
    BY_ISBN: (isbn: string) => `/books/${isbn}`,
    SEARCH: "/books",
    CREATE: "/books",
    UPDATE: (isbn: string) => `/books/${isbn}`,
    DELETE: (isbn: string) => `/books/${isbn}`,
    REMOVE_CO_AUTHORS: (isbn: string) =>
      `/books/${isbn}/co-authors`,
  },

  // Autores (Authors)
  AUTORES: {
    BASE: "/authors",
    ALL: "/authors/all",
    BY_NAME: "/authors",
    BY_EMAIL: (email: string) => `/authors/${email}`,
    CREATE: "/authors",
    UPDATE: (email: string) => `/authors/${email}`,
    DELETE: (email: string) => `/authors/${email}`,
  },

  // Categorias (Categories)
  CATEGORIAS: {
    BASE: "/categories",
    SEARCH: "/categories",
    SEARCH_BY_DESCRIPTION: (description: string) =>
      `/categories?description=${encodeURIComponent(description)}`,
    BY_ID: (id: number) => `/categories/${id}`,
    CREATE: "/categories",
    UPDATE: (id: number) => `/categories/${id}`,
    DELETE: (id: number) => `/categories/${id}`,
  },

  // Subcategorias (SubCategories)
  SUBCATEGORIAS: {
    BASE: "/subcategories",
    BY_ID: (id: number) => `/subcategories/${id}`,
    BY_CATEGORY: (categoryCode: number) =>
      `/subcategories?categoryCode=${categoryCode}`,
    SEARCH_BY_NAME: (name: string) =>
      `/subcategories/search/${name}`,
    CREATE: "/subcategories",
    UPDATE: (id: number) => `/subcategories/${id}`,
    DELETE: (id: number) => `/subcategories/${id}`,
  },

  // Usuários (Users)
  USUARIOS: {
    BASE: "/users",
    ME: "/users/me",
    ALL: "/users/all",
    CREATE: "/users/create",
    BY_ENROLLMENT: (enrollment: string) =>
      `/users/${enrollment}`,
    UPDATE_TEACHER: (enrollment: string) =>
      `/users/teacher/${enrollment}`,
    UPDATE_STUDENT: (enrollment: string) =>
      `/users/student/${enrollment}`,
    UPDATE_EMPLOYEE: (enrollment: string) =>
      `/users/employee/${enrollment}`,
    DELETE: (enrollment: string) => `/users/${enrollment}`,
    TEACHERS_BY_COURSE: "/users/teachers/by-course",
    STUDENTS_BY_COURSE: "/users/students/by-course",
    USERS_BY_COURSE: "/users/by-course",
  },

  // Cursos (Courses)
  CURSOS: {
    BASE: "/courses",
    ALL: "/courses/all",
    CREATE: "/courses",
    BY_ID: (id: number) => `/courses/${id}`,
    BY_NAME: (courseName: string) =>
      `/courses/name/${courseName}`,
    UPDATE: "/courses",
    DELETE: (id: number) => `/courses/${id}`,
  },

  // Telefones (Phones)
  TELEFONES: {
    BASE: "/phones",
    CREATE: "/phones",
    BY_ID: (id: number) => `/phones/${id}`,
    UPDATE: (id: number) => `/phones/${id}`,
    DELETE: (id: number) => `/phones/${id}`,
  },

  // Empréstimos (Loans)
  EMPRESTIMOS: {
    BASE: "/loans",
    BY_ID: (id: number) => `/loans/${id}`,
    BY_USER: "/loans/users",
    CREATE_SELF: "/loans/user",
    CREATE_USER: "/loans/user",
    CREATE_ADMIN: (userId: string) =>
      `/loans/admin/${userId}`,
    RETURN: "/loans/return",
  },

  // Cópias (Copies)
  COPIAS: {
    BASE: "/copies",
    CREATE: "/copies",
    BY_ID: (sequential: number, isbn: string) =>
      `/copies/${sequential}/${isbn}`,
    UPDATE: (sequential: number) => `/copies/${sequential}`,
    DELETE: (sequential: number, isbn: string) =>
      `/copies/${sequential}/${isbn}`,
    BY_STATUS: (isbn: string) => `/copies/status/${isbn}`,
    ALL_BY_ISBN: (isbn: string) => `/copies/all/${isbn}`,
  },

  // Reservas (Reserves)
  RESERVAS: {
    BASE: "/reserves",
    CREATE: "/reserves",
    BY_ID: (id: number) => `/reserves/${id}`,
    BY_USER: "/reserves/users",
    BY_BOOK: (isbn: string) => `/reserves/books/${isbn}`,
    DELETE: (id: number) => `/reserves/${id}`,
  },

  // Multas (Fines)
  MULTAS: {
    BASE: "/fines",
    BY_ID: (id: number) => `/fines/${id}`,
    PAY: (id: number) => `/fines/pay/${id}`,
    USER_PENDING: "/fines/user/pending",
    USER_PENDING_BY_ID: (userId: string) =>
      `/fines/user/pending/${userId}`,
    USER_PAID: "/fines/user/paid",
    USER_PAID_BY_ID: (userId: string) =>
      `/fines/user/paid/${userId}`,
  },
} as const;

/**
 * Chaves do localStorage
 */
export const STORAGE_KEYS = {
  AUTH_TOKEN: "auth-token",
  USER_DATA: "user-data",
  THEME: "theme",
} as const;

/**
 * Rotas de redirecionamento por perfil
 * Usa os nomes de perfil que vêm do backend JWT
 */
export const PERFIL_ROUTES = {
  USUARIO: "/usuario", // Alunos e Professores
  BIBLIOTECARIO: "/bibliotecario/dashboard",
  ADMIN: "/admin/dashboard", // Administrador
} as const;
