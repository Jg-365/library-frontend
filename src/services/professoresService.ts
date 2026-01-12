/**
 * Serviço de Professores/Usuários - Consumindo API real
 *
 * Este serviço agora usa a API de usuários (users) que inclui professores.
 * Agora integrado com a API real do backend.
 */

import api from "./api";
import { API_ENDPOINTS } from "@/config/constants";
import type { Professor } from "@/types";
import type { MyPage } from "@/types/BackendResponses";

const normalizeProfessoresPage = (
  data: MyPage<Professor> | Professor[]
): MyPage<Professor> => {
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

export const professoresService = {
  /**
   * Listar todos os professores
   * GET /users/all (filtrar tipo professor no frontend)
   */
  async listarTodos(): Promise<MyPage<Professor>> {
    const response = await api.get<
      MyPage<Professor> | Professor[]
    >(
      API_ENDPOINTS.USUARIOS.ALL
    );
    const page = normalizeProfessoresPage(response.data);
    const professores = page.content.filter(
      (user: any) => user.tipo === "PROFESSOR"
    );
    return {
      ...page,
      content: professores,
      totalElements: professores.length,
    };
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
   * GET /users/teachers/by-course?course=<nome>
   */
  async listarPorCurso(
    curso: string | number
  ): Promise<MyPage<Professor>> {
    const courseName = await resolveCourseName(curso);
    const response = await api.get<
      MyPage<Professor> | Professor[]
    >(
      `${API_ENDPOINTS.USUARIOS.TEACHERS_BY_COURSE}?course=${encodeURIComponent(
        courseName
      )}`
    );
    return normalizeProfessoresPage(response.data);
  },
};

