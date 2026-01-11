/**
 * Serviço de Cursos - Consumindo API real
 *
 * Este serviço centraliza todas as operações relacionadas a cursos.
 * Integrado com a API real do backend.
 */

import api from "./api";
import { API_ENDPOINTS } from "@/config/constants";
import type {
  CourseCreateRequest,
  CourseUpdateRequest,
  Curso,
} from "@/types";

const toCoursePayload = (
  dados: CourseCreateRequest | CourseUpdateRequest
) => ({
  courseCode: dados.courseCode,
  courseName: dados.courseName,
});

function mapCursoResponse(curso: any): Curso {
  return {
    courseCode:
      curso?.courseCode ?? curso?.cod_curso ?? curso?.id ?? 0,
    courseName: curso?.courseName ?? curso?.nome ?? "",
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
    return (response.data || []).map(mapCursoResponse);
  },

  /**
   * Criar novo curso
   * POST /courses
   */
  async criar(
    dados: CourseCreateRequest
  ): Promise<Curso> {
    const response = await api.post<Curso>(
      API_ENDPOINTS.CURSOS.CREATE,
      toCoursePayload(dados)
    );
    return mapCursoResponse(response.data);
  },

  /**
   * Buscar curso por ID
   * GET /courses/{id}
   */
  async buscarPorId(id: number): Promise<Curso> {
    const response = await api.get(
      API_ENDPOINTS.CURSOS.BY_ID(id)
    );
    return mapCursoResponse(response.data);
  },

  /**
   * Buscar curso por nome
   * GET /courses/name/{courseName}
   */
  async buscarPorNome(courseName: string): Promise<Curso> {
    const response = await api.get(
      API_ENDPOINTS.CURSOS.BY_NAME(courseName)
    );
    return mapCursoResponse(response.data);
  },

  /**
   * Atualizar curso existente
   * PATCH /courses
   */
  async atualizar(
    dados: CourseUpdateRequest
  ): Promise<Curso> {
    const response = await api.patch(
      API_ENDPOINTS.CURSOS.UPDATE,
      toCoursePayload(dados)
    );
    return mapCursoResponse(response.data);
  },

  /**
   * Deletar curso
   * DELETE /courses/{id}
   */
  async deletar(id: number): Promise<void> {
    await api.delete(API_ENDPOINTS.CURSOS.DELETE(id));
  },
};
