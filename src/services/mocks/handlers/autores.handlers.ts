import type MockAdapter from "axios-mock-adapter";
import { mockAutores } from "../data";

export function setupAutoresHandlers(mock: MockAdapter) {
  // Mock para listar autores
  mock.onGet("/autores").reply(200, mockAutores);

  // Mock para buscar autor por ID
  mock.onGet(/\/autores\/\d+/).reply((config) => {
    const id = parseInt(
      config.url?.split("/").pop() || "0"
    );
    const autor = mockAutores.find((a) => a.id === id);

    if (!autor) {
      return [404, { message: "Autor não encontrado" }];
    }

    return [200, autor];
  });

  // Mock para criar autor
  mock.onPost("/autores").reply((config) => {
    const novoAutor = JSON.parse(config.data);
    const autorComId = {
      ...novoAutor,
      id: mockAutores.length + 1,
    };

    mockAutores.push(autorComId);
    return [201, autorComId];
  });

  // Mock para atualizar autor
  mock.onPut(/\/autores\/\d+/).reply((config) => {
    const id = parseInt(
      config.url?.split("/").pop() || "0"
    );
    const autorIndex = mockAutores.findIndex(
      (a) => a.id === id
    );

    if (autorIndex === -1) {
      return [404, { message: "Autor não encontrado" }];
    }

    const dadosAtualizados = JSON.parse(config.data);
    const autorAtualizado = {
      ...mockAutores[autorIndex],
      ...dadosAtualizados,
    };

    mockAutores[autorIndex] = autorAtualizado;
    return [200, autorAtualizado];
  });

  // Mock para deletar autor
  mock.onDelete(/\/autores\/\d+/).reply((config) => {
    const id = parseInt(
      config.url?.split("/").pop() || "0"
    );
    const autorIndex = mockAutores.findIndex(
      (a) => a.id === id
    );

    if (autorIndex === -1) {
      return [404, { message: "Autor não encontrado" }];
    }

    mockAutores.splice(autorIndex, 1);
    return [204];
  });
}

