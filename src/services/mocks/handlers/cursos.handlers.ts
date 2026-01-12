import MockAdapter from "axios-mock-adapter";
import { mockCursos } from "../data/cursos.mock";
import { cursoFormSchema } from "@/schemas/CursoSchema";

let cursos = [...mockCursos];

export function setupCursosHandlers(mock: MockAdapter) {
  // GET /cursos - Listar todos os cursos
  mock.onGet("/cursos").reply(() => {
    return [200, cursos];
  });

  // GET /cursos/:id - Buscar curso por ID
  mock.onGet(/\/cursos\/\d+/).reply((config) => {
    const id = Number(config.url?.split("/").pop());
    const curso = cursos.find(
      (c) => c.courseCode === id
    );

    if (!curso) {
      return [404, { message: "Curso não encontrado" }];
    }

    return [200, curso];
  });

  // POST /cursos - Criar novo curso
  mock.onPost("/cursos").reply((config) => {
    try {
      const dadosFormulario = JSON.parse(config.data);
      const dadosValidados =
        cursoFormSchema.parse(dadosFormulario);

      // Verifica se o nome já existe
      const nomeExiste = cursos.some(
        (c) =>
          c.courseName.toLowerCase() ===
          dadosValidados.courseName.toLowerCase()
      );

      if (nomeExiste) {
        return [
          400,
          { message: "Já existe um curso com este nome" },
        ];
      }

      const novoCurso = {
        courseCode:
          Math.max(...cursos.map((c) => c.courseCode)) + 1,
        codigo: `CUR${String(cursos.length + 1).padStart(3, "0")}`,
        ...dadosValidados,
      };

      cursos.push(novoCurso);
      return [201, novoCurso];
    } catch (error: any) {
      console.error("Erro ao criar curso:", error);
      if (error.errors) {
        return [
          400,
          {
            message: "Dados inválidos",
            errors: error.errors,
          },
        ];
      }
      return [400, { message: "Erro ao criar curso" }];
    }
  });

  // PUT /cursos/:id - Atualizar curso
  mock.onPut(/\/cursos\/\d+/).reply((config) => {
    try {
      const id = Number(config.url?.split("/").pop());
      const dadosFormulario = JSON.parse(config.data);
      const indice = cursos.findIndex(
        (c) => c.courseCode === id
      );

      if (indice === -1) {
        return [404, { message: "Curso não encontrado" }];
      }

      const dadosValidados =
        cursoFormSchema.parse(dadosFormulario);

      // Verifica se o nome já existe em outro curso
      const nomeExiste = cursos.some(
        (c) =>
          c.courseCode !== id &&
          c.courseName.toLowerCase() ===
            dadosValidados.courseName.toLowerCase()
      );

      if (nomeExiste) {
        return [
          400,
          {
            message: "Já existe outro curso com este nome",
          },
        ];
      }

      cursos[indice] = {
        ...cursos[indice],
        ...dadosValidados,
      };

      return [200, cursos[indice]];
    } catch (error: any) {
      console.error("Erro ao atualizar curso:", error);
      if (error.errors) {
        return [
          400,
          {
            message: "Dados inválidos",
            errors: error.errors,
          },
        ];
      }
      return [400, { message: "Erro ao atualizar curso" }];
    }
  });

  // DELETE /cursos/:id - Excluir curso
  mock.onDelete(/\/cursos\/\d+/).reply((config) => {
    const id = Number(config.url?.split("/").pop());
    const indice = cursos.findIndex(
      (c) => c.courseCode === id
    );

    if (indice === -1) {
      return [404, { message: "Curso não encontrado" }];
    }

    cursos.splice(indice, 1);
    return [204];
  });
}

