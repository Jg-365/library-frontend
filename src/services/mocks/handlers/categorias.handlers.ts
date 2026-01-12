import type MockAdapter from "axios-mock-adapter";
import { mockCategorias } from "../data";

export function setupCategoriasHandlers(mock: MockAdapter) {
  // Mock para listar categorias
  mock.onGet("/categorias").reply(200, mockCategorias);

  // Mock para buscar categoria por ID
  mock.onGet(/\/categorias\/\d+/).reply((config) => {
    const id = parseInt(
      config.url?.split("/").pop() || "0"
    );
    const categoria = mockCategorias.find(
      (c) => c.categoryCode === id
    );

    if (!categoria) {
      return [404, { message: "Categoria não encontrada" }];
    }

    return [200, categoria];
  });

  // Mock para criar categoria
  mock.onPost("/categorias").reply((config) => {
    const novaCategoria = JSON.parse(config.data);
    const categoriaComId = {
      ...novaCategoria,
      categoryCode: mockCategorias.length + 1,
    };

    mockCategorias.push(categoriaComId);
    return [201, categoriaComId];
  });

  // Mock para atualizar categoria
  mock.onPut(/\/categorias\/\d+/).reply((config) => {
    const id = parseInt(
      config.url?.split("/").pop() || "0"
    );
    const categoriaIndex = mockCategorias.findIndex(
      (c) => c.categoryCode === id
    );

    if (categoriaIndex === -1) {
      return [404, { message: "Categoria não encontrada" }];
    }

    const dadosAtualizados = JSON.parse(config.data);
    const categoriaAtualizada = {
      ...mockCategorias[categoriaIndex],
      ...dadosAtualizados,
    };

    mockCategorias[categoriaIndex] = categoriaAtualizada;
    return [200, categoriaAtualizada];
  });

  // Mock para deletar categoria
  mock.onDelete(/\/categorias\/\d+/).reply((config) => {
    const id = parseInt(
      config.url?.split("/").pop() || "0"
    );
    const categoriaIndex = mockCategorias.findIndex(
      (c) => c.categoryCode === id
    );

    if (categoriaIndex === -1) {
      return [404, { message: "Categoria não encontrada" }];
    }

    mockCategorias.splice(categoriaIndex, 1);
    return [204];
  });
}

