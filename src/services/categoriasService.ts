/**
 * Serviço de Categorias - Consumindo API real
 *
 * Este serviço centraliza todas as operações relacionadas a categorias.
 * Integrado com a API real do backend.
 */

import api from "./api";
import { API_ENDPOINTS } from "@/config/constants";
import type { Categoria } from "@/types";
import type {
  CategoryResponse,
} from "@/types/BackendResponses";

const mapCategoriaResponse = (
  categoria: CategoryResponse
): Categoria => ({
  categoryCode: categoria.categoryCode,
  description: categoria.description,
});

export const categoriasService = {
  /**
   * Listar/Buscar todas as categorias
   * GET /categories
   */
  async listarTodas(): Promise<Categoria[]> {
    // Alguns backends exigem o parâmetro `description` mesmo para listagem;
    // enviar `description=` evita Bad Request quando o parâmetro é obrigatório.
    const response = await api.get<CategoryResponse[]>(
      API_ENDPOINTS.CATEGORIAS.SEARCH_BY_DESCRIPTION("")
    );
    return response.data.map(mapCategoriaResponse);
  },

  /**
   * Buscar categoria por ID
   * GET /categories/{id}
   */
  async buscarPorId(id: number): Promise<Categoria> {
    const response = await api.get<CategoryResponse>(
      API_ENDPOINTS.CATEGORIAS.BY_ID(id)
    );
    return mapCategoriaResponse(response.data);
  },

  /**
   * Criar nova categoria
   * POST /categories
   */
  async criar(
    dados: Pick<Categoria, "description">
  ): Promise<Categoria> {
    const response = await api.post<CategoryResponse>(
      API_ENDPOINTS.CATEGORIAS.CREATE,
      dados
    );
    return mapCategoriaResponse(response.data);
  },

  /**
   * Atualizar categoria existente
   * PATCH /categories/{id}
   */
  async atualizar(
    id: number,
    dados: Partial<Pick<Categoria, "description">>
  ): Promise<Categoria> {
    const response = await api.patch<CategoryResponse>(
      API_ENDPOINTS.CATEGORIAS.UPDATE(id),
      dados
    );
    return mapCategoriaResponse(response.data);
  },

  /**
   * Deletar categoria
   * DELETE /categories/{id}
   */
  async deletar(id: number): Promise<void> {
    await api.delete(API_ENDPOINTS.CATEGORIAS.DELETE(id));
  },
};
