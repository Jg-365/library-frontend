/**
 * Serviço de Usuários - Consumindo API real
 *
 * Este serviço centraliza todas as operações relacionadas a usuários.
 * Integrado com a API real do backend.
 */

import api from "./api";
import { API_ENDPOINTS } from "@/config/constants";
import type { CreateUsuarioPayload, Usuario } from "@/types";

export const usuariosService = {
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
    return response.data;
  },

  /**
   * Buscar usuário por enrollment
   * GET /users/{enrollment}
   */
  async buscarPorEnrollment(
    enrollment: string
  ): Promise<Usuario> {
    const response = await api.get<Usuario>(
      API_ENDPOINTS.USUARIOS.BY_ENROLLMENT(enrollment)
    );
    return response.data;
  },

  /**
   * Listar todos os usuários
   * GET /users/all
   */
  async listarTodos(): Promise<Usuario[]> {
    const response = await api.get(
      API_ENDPOINTS.USUARIOS.ALL
    );
    const usersArray = Array.isArray(response.data)
      ? response.data
      : response.data?.content || [];
    return usersArray;
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
  },

  /**
   * Listar professores por curso
   * GET /users/teachers/by-course
   */
  async listarProfessoresPorCurso(
    cursoId: number
  ): Promise<Usuario[]> {
    const response = await api.get<Usuario[]>(
      `${API_ENDPOINTS.USUARIOS.TEACHERS_BY_COURSE}?cursoId=${cursoId}`
    );
    return response.data;
  },
};
