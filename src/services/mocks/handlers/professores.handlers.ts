import type MockAdapter from "axios-mock-adapter";
import { mockProfessores } from "../data";
import { mockCursos } from "../data/cursos.mock";
import type {
  ProfessoresPorCurso,
  Professor,
} from "@/types/Professor";

/**
 * Configura os handlers para professores
 */
export function setupProfessoresHandlers(
  mock: MockAdapter
) {
  // GET /professores - Listar todos os professores
  mock.onGet("/professores").reply(200, mockProfessores);

  // GET /professores/:id - Buscar professor por ID
  mock.onGet(/\/professores\/\d+$/).reply((config) => {
    const id = parseInt(
      config.url?.split("/").pop() || "0"
    );
    const professor = mockProfessores.find(
      (p) => p.id === id
    );

    if (professor) {
      // Adicionar informações do curso se existir
      if (professor.cursoId) {
        const curso = mockCursos.find(
          (c) => c.courseCode === professor.cursoId
        );
        const professorComCurso: Professor = {
          ...professor,
          curso,
        };
        return [200, professorComCurso];
      }
      return [200, professor];
    }
    return [404, { message: "Professor não encontrado" }];
  });

  // GET /professores/curso/:cursoId - Listar professores por curso
  mock
    .onGet(/\/professores\/curso\/\d+/)
    .reply((config) => {
      const cursoId = parseInt(
        config.url?.split("/").pop() || "0"
      );
      const professoresDoCurso = mockProfessores.filter(
        (p) => p.cursoId === cursoId
      );

      const curso = mockCursos.find(
        (c) => c.courseCode === cursoId
      );

      const resultado: ProfessoresPorCurso = {
        cursoId,
        curso,
        professores: professoresDoCurso,
        total: professoresDoCurso.length,
      };

      return [200, resultado];
    });
}
