/**
 * Serviço de Categorias - Consumindo API real
 *
 * Este serviço centraliza todas as operações relacionadas a categorias.
 * Integrado com a API real do backend.
 */

import api from "./api";
import { API_ENDPOINTS } from "@/config/constants";
import type { Categoria } from "@/types";

function mapCategoriaResponse(
  categoria: any,
  index: number
): Categoria {
  const id =
    categoria?.id ?? categoria?.categoryCode ?? index;
  const descricao =
    categoria?.description ?? categoria?.descricao ?? "";
  return {
    id,
    codigo: categoria?.codigo ?? String(id),
    nome: categoria?.nome ?? descricao,
    descricao,
  };
}

export const categoriasService = {
  /**
   * Listar/Buscar todas as categorias
   * GET /categories
   */
  async listarTodas(
    description: string = ""
  ): Promise<Categoria[]> {
    const response = await api.get<Categoria[]>(
      API_ENDPOINTS.CATEGORIAS.SEARCH,
      {
        params: {
          description,
        },
      }
    );
    return (response.data || []).map(
      (categoria: any, index: number) =>
        mapCategoriaResponse(categoria, index)
    );
  },

  /**
   * Buscar categorias por descrição
   * GET /categories?description=...
   */
  async buscarPorDescricao(
    description: string
  ): Promise<Categoria[]> {
    const response = await api.get(
      API_ENDPOINTS.CATEGORIAS.SEARCH_BY_DESCRIPTION(
        description
      )
    );
    return (response.data || []).map(
      (categoria: any, index: number) =>
        mapCategoriaResponse(categoria, index)
    );
  },

  /**
   * Buscar categoria por ID
   * GET /categories/{id}
   */
  async buscarPorId(id: number): Promise<Categoria> {
    const response = await api.get(
      API_ENDPOINTS.CATEGORIAS.BY_ID(id)
    );
    return mapCategoriaResponse(response.data, 0);
  },

  /**
   * Criar nova categoria
   * POST /categories
   */
  async criar(dados: {
    description: string;
  }): Promise<Categoria> {
    const response = await api.post(
      API_ENDPOINTS.CATEGORIAS.CREATE,
      dados
    );
    return mapCategoriaResponse(response.data, 0);
  },

  /**
   * Atualizar categoria existente
   * PATCH /categories/{id}
   */
  async atualizar(
    id: number,
    dados: { description?: string }
  ): Promise<Categoria> {
    const response = await api.patch(
      API_ENDPOINTS.CATEGORIAS.UPDATE(id),
      dados
    );
    return mapCategoriaResponse(response.data, 0);
  },

  /**
   * Deletar categoria
   * DELETE /categories/{id}
   */
  async deletar(id: number): Promise<void> {
    await api.delete(API_ENDPOINTS.CATEGORIAS.DELETE(id));
  },
};
