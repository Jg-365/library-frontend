/**
 * Serviço de Usuários - Consumindo API real
 *
 * Este serviço centraliza todas as operações relacionadas a usuários.
 * Integrado com a API real do backend.
 */

import api from "./api";
import { API_ENDPOINTS } from "@/config/constants";
import type { Usuario } from "@/types";

const resolveCourseName = async (
  course: string | number
): Promise<string> => {
  if (typeof course === "string") {
    return course;
  }

  const response = await api.get(
    API_ENDPOINTS.CURSOS.BY_ID(course)
  );
  return (
    response.data?.courseName ||
    response.data?.nome ||
    response.data?.name ||
    ""
  );
};

export const usuariosService = {
  /**
   * Criar novo usuário
   * POST /users/create
   */
  async criar(
    dados: Omit<Usuario, "id">
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
    const response = await api.get<Usuario[]>(
      API_ENDPOINTS.USUARIOS.ALL
    );
    return response.data;
  },

  /**
   * Atualizar dados de professor
   * PATCH /users/teacher/{enrollment}
   */
  async atualizarProfessor(
    enrollment: string,
    dados: Partial<Usuario>
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
    dados: Partial<Usuario>
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
    dados: Partial<Usuario>
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
   * GET /users/teachers/by-course?course=<nome>
   */
  async listarProfessoresPorCurso(
    course: string | number
  ): Promise<Usuario[]> {
    const courseName = await resolveCourseName(course);
    const response = await api.get<Usuario[]>(
      `${API_ENDPOINTS.USUARIOS.TEACHERS_BY_COURSE}?course=${encodeURIComponent(
        courseName
      )}`
    );
    return response.data;
  },
};
