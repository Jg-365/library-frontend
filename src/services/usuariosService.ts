/**
 * Serviço de Usuários - Consumindo API real
 *
 * Este serviço centraliza todas as operações relacionadas a usuários.
 * Integrado com a API real do backend.
 */

import api from "./api";
import { API_ENDPOINTS } from "@/config/constants";
import type { Usuario } from "@/types";
import type { MyPage } from "@/types/BackendResponses";

const normalizeUsuariosPage = (
  data: MyPage<Usuario> | Usuario[]
): MyPage<Usuario> => {
  if (Array.isArray(data)) {
    return {
      content: data,
      totalElements: data.length,
      currentPage: 0,
      totalPages: 1,
    };
  }

  return {
    content: data.content || [],
    totalElements:
      data.totalElements ?? data.content?.length ?? 0,
    currentPage: data.currentPage ?? 0,
    totalPages: data.totalPages ?? 1,
  };
};

export const usuariosService = {
  _cache: new Map<string, MyPage<Usuario>>(),

  _cacheKey(options?: { page?: number; size?: number }) {
    if (!options?.page && !options?.size) {
      return "all";
    }
    return `page=${options?.page ?? 0}&size=${
      options?.size ?? 10
    }`;
  },

  /**
   * Criar novo usuário
   * POST /users/create
   */
  async criar(
    dados: CreateUsuarioPayload
  ): Promise<Usuario> {
    const response = await api.post<Usuario>(
      API_ENDPOINTS.USUARIOS.CREATE,
      dados
    );
    usuariosService._cache.clear();
    return response.data;
  },

  /**
   * Buscar usuário por enrollment
   * GET /users/{enrollment}
   */
  async buscarPorEnrollment(
    enrollment: string
  ): Promise<Usuario> {
    const normalizedEnrollment = enrollment.trim();
    if (!/^\d+$/.test(normalizedEnrollment)) {
      throw new Error(
        "Enrollment inválido: esperado valor numérico."
      );
    }
    const response = await api.get<Usuario>(
      API_ENDPOINTS.USUARIOS.BY_ENROLLMENT(
        normalizedEnrollment
      )
    );
    return response.data;
  },

  /**
   * Listar todos os usuários
   * GET /users/all
   */
  async listarTodos(options?: {
    page?: number;
    size?: number;
    force?: boolean;
  }): Promise<MyPage<Usuario>> {
    const cacheKey = usuariosService._cacheKey(options);
    if (!options?.force && usuariosService._cache.has(cacheKey)) {
      return (
        usuariosService._cache.get(cacheKey) ||
        normalizeUsuariosPage([])
      );
    }
    const response = await api.get<
      MyPage<Usuario> | Usuario[]
    >(API_ENDPOINTS.USUARIOS.ALL, {
      params:
        options?.page !== undefined ||
        options?.size !== undefined
          ? {
              page: options?.page,
              size: options?.size,
            }
          : undefined,
    });
    const normalized = normalizeUsuariosPage(response.data);
    usuariosService._cache.set(cacheKey, normalized);
    return normalized;
  },

  /**
   * Atualizar dados de professor
   * PATCH /users/teacher/{enrollment}
   */
  async atualizarProfessor(
    enrollment: string,
    dados: Partial<CreateUsuarioPayload>
  ): Promise<Usuario> {
    const response = await api.patch<Usuario>(
      API_ENDPOINTS.USUARIOS.UPDATE_TEACHER(enrollment),
      dados
    );
    usuariosService._cache.clear();
    return response.data;
  },

  /**
   * Atualizar dados de aluno
   * PATCH /users/student/{enrollment}
   */
  async atualizarAluno(
    enrollment: string,
    dados: Partial<CreateUsuarioPayload>
  ): Promise<Usuario> {
    const response = await api.patch<Usuario>(
      API_ENDPOINTS.USUARIOS.UPDATE_STUDENT(enrollment),
      dados
    );
    usuariosService._cache.clear();
    return response.data;
  },

  /**
   * Atualizar dados de funcionário
   * PATCH /users/employee/{enrollment}
   */
  async atualizarFuncionario(
    enrollment: string,
    dados: Partial<CreateUsuarioPayload>
  ): Promise<Usuario> {
    const response = await api.patch<Usuario>(
      API_ENDPOINTS.USUARIOS.UPDATE_EMPLOYEE(enrollment),
      dados
    );
    usuariosService._cache.clear();
    return response.data;
  },

  /**
   * Deletar usuário
   * DELETE /users/{enrollment}
   */
  async deletar(enrollment: string): Promise<void> {
    await api.delete(
      API_ENDPOINTS.USUARIOS.DELETE(enrollment)
    );
    usuariosService._cache.clear();
  },

  /**
   * Listar professores por curso
   * GET /users/teachers/by-course?course=<nome>
   */
  async listarProfessoresPorCurso(
    cursoId: number
  ): Promise<MyPage<Usuario>> {
    const response = await api.get<
      MyPage<Usuario> | Usuario[]
    >(
      `${API_ENDPOINTS.USUARIOS.TEACHERS_BY_COURSE}?cursoId=${cursoId}`
    );
    return normalizeUsuariosPage(response.data);
  },
};
