/**
 * Serviço de Cursos - Consumindo API real
 *
 * Este serviço centraliza todas as operações relacionadas a cursos.
 * Integrado com a API real do backend.
 */

import api from "./api";
import { API_ENDPOINTS } from "@/config/constants";
import type { Curso } from "@/types";

export const cursosService = {
  /**
   * Criar novo curso
   * POST /courses
   */
  async criar(
    dados: Omit<Curso, "courseCode">
  ): Promise<Curso> {
    const response = await api.post<Curso>(
      API_ENDPOINTS.CURSOS.CREATE,
      dados
    );
    return response.data;
  },

  /**
   * Buscar curso por ID
   * GET /courses/{id}
   */
  async buscarPorId(id: number): Promise<Curso> {
    const response = await api.get<Curso>(
      API_ENDPOINTS.CURSOS.BY_ID(id)
    );
    return response.data;
  },

  /**
   * Buscar curso por nome
   * GET /courses/name/{courseName}
   */
  async buscarPorNome(courseName: string): Promise<Curso> {
    const response = await api.get<Curso>(
      API_ENDPOINTS.CURSOS.BY_NAME(courseName)
    );
    return response.data;
  },

  /**
   * Atualizar curso existente
   * PATCH /courses
   */
  async atualizar(dados: Partial<Curso>): Promise<Curso> {
    const response = await api.patch<Curso>(
      API_ENDPOINTS.CURSOS.UPDATE,
      dados
    );
    return response.data;
  },

  /**
   * Deletar curso
   * DELETE /courses/{id}
   */
  async deletar(id: number): Promise<void> {
    await api.delete(API_ENDPOINTS.CURSOS.DELETE(id));
  },
};
