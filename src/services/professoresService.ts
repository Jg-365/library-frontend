/**
 * Serviço de Professores/Usuários - Consumindo API real
 *
 * Este serviço agora usa a API de usuários (users) que inclui professores.
 * Agora integrado com a API real do backend.
 */

import api from "./api";
import { API_ENDPOINTS } from "@/config/constants";
import type { Professor } from "@/types";

export const professoresService = {
  /**
   * Listar todos os professores
   * GET /users/all (filtrar tipo professor no frontend)
   */
  async listarTodos(): Promise<Professor[]> {
    const response = await api.get<Professor[]>(
      API_ENDPOINTS.USUARIOS.ALL
    );
    // Filtrar apenas professores
    return response.data.filter(
      (user: any) => user.tipo === "PROFESSOR"
    );
  },

  /**
   * Buscar professor por enrollment
   * GET /users/{enrollment}
   */
  async buscarPorEnrollment(
    enrollment: string
  ): Promise<Professor> {
    const response = await api.get<Professor>(
      API_ENDPOINTS.USUARIOS.BY_ENROLLMENT(enrollment)
    );
    return response.data;
  },

  /**
   * Listar professores por curso
   * GET /users/teachers/by-course
   */
  async listarPorCurso(
    cursoId: number
  ): Promise<Professor[]> {
    const response = await api.get<Professor[]>(
      `${API_ENDPOINTS.USUARIOS.TEACHERS_BY_COURSE}?cursoId=${cursoId}`
    );
    return response.data;
  },
};
