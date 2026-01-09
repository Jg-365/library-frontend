import type MockAdapter from "axios-mock-adapter";
import { mockSubcategorias } from "../data";

/**
 * Configura os handlers para subcategorias
 */
export function setupSubcategoriasHandlers(
  mock: MockAdapter
) {
  // GET /subcategorias - Listar todas as subcategorias
  mock
    .onGet("/subcategorias")
    .reply(200, mockSubcategorias);

  // GET /subcategorias/:id - Buscar subcategoria por ID
  mock.onGet(/\/subcategorias\/\d+/).reply((config) => {
    const id = parseInt(
      config.url?.split("/").pop() || "0"
    );
    const subcategoria = mockSubcategorias.find(
      (s) => s.id === id
    );

    if (subcategoria) {
      return [200, subcategoria];
    }
    return [
      404,
      { message: "Subcategoria não encontrada" },
    ];
  });

  // GET /subcategorias/categoria/:categoriaId - Listar subcategorias por categoria
  mock
    .onGet(/\/subcategorias\/categoria\/\d+/)
    .reply((config) => {
      const categoriaId = parseInt(
        config.url?.split("/").pop() || "0"
      );
      const subcategorias = mockSubcategorias.filter(
        (s) => s.categoryCode === categoriaId
      );

      return [200, subcategorias];
    });

  // POST /subcategorias - Criar nova subcategoria
  mock.onPost("/subcategorias").reply((config) => {
    const dados = JSON.parse(config.data);
    const novaSubcategoria = {
      ...dados,
      id: mockSubcategorias.length + 1,
    };
    mockSubcategorias.push(novaSubcategoria);
    return [201, novaSubcategoria];
  });

  // PUT /subcategorias/:id - Atualizar subcategoria
  mock.onPut(/\/subcategorias\/\d+/).reply((config) => {
    const id = parseInt(
      config.url?.split("/").pop() || "0"
    );
    const index = mockSubcategorias.findIndex(
      (s) => s.id === id
    );

    if (index === -1) {
      return [
        404,
        { message: "Subcategoria não encontrada" },
      ];
    }

    const dados = JSON.parse(config.data);
    mockSubcategorias[index] = {
      ...mockSubcategorias[index],
      ...dados,
    };
    return [200, mockSubcategorias[index]];
  });

  // DELETE /subcategorias/:id - Deletar subcategoria
  mock.onDelete(/\/subcategorias\/\d+/).reply((config) => {
    const id = parseInt(
      config.url?.split("/").pop() || "0"
    );
    const index = mockSubcategorias.findIndex(
      (s) => s.id === id
    );

    if (index === -1) {
      return [
        404,
        { message: "Subcategoria não encontrada" },
      ];
    }

    mockSubcategorias.splice(index, 1);
    return [204];
  });
}
