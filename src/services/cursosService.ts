/**
 * Serviço de Cursos - Consumindo API real
 *
 * Este serviço centraliza todas as operações relacionadas a cursos.
 * Integrado com a API real do backend.
 */

import api from "./api";
import { API_ENDPOINTS } from "@/config/constants";
import type { Curso } from "@/types";

export interface CursoPayload {
  courseCode?: number;
  courseName: string;
}

function mapCursoResponse(
  curso: any,
  index: number
): Curso {
  return {
    cod_curso:
      curso?.cod_curso ??
      curso?.courseCode ??
      curso?.id ??
      index,
    nome: curso?.nome ?? curso?.courseName ?? "",
  };
}

export const cursosService = {
  /**
   * Listar todos os cursos
   * GET /courses
   */
  async listarTodos(): Promise<Curso[]> {
    const response = await api.get(
      API_ENDPOINTS.CURSOS.BASE
    );
    return (response.data || []).map(
      (curso: any, index: number) =>
        mapCursoResponse(curso, index)
    );
  },

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
    return mapCursoResponse(response.data, 0);
  },

  /**
   * Buscar curso por ID
   * GET /courses/{id}
   */
  async buscarPorId(id: number): Promise<Curso> {
    const response = await api.get(
      API_ENDPOINTS.CURSOS.BY_ID(id)
    );
    return mapCursoResponse(response.data, 0);
  },

  /**
   * Buscar curso por nome
   * GET /courses/name/{courseName}
   */
  async buscarPorNome(courseName: string): Promise<Curso> {
    const response = await api.get(
      API_ENDPOINTS.CURSOS.BY_NAME(courseName)
    );
    return mapCursoResponse(response.data, 0);
  },

  /**
   * Atualizar curso existente
   * PATCH /courses
   */
  async atualizar(dados: CursoPayload): Promise<Curso> {
    const response = await api.patch(
      API_ENDPOINTS.CURSOS.UPDATE,
      dados
    );
    return mapCursoResponse(response.data, 0);
  },

  /**
   * Deletar curso
   * DELETE /courses/{id}
   */
  async deletar(id: number): Promise<void> {
    await api.delete(API_ENDPOINTS.CURSOS.DELETE(id));
  },
};
