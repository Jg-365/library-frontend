/**
 * Serviço de Subcategorias - Consumindo API real
 *
 * Este serviço centraliza todas as operações relacionadas a subcategorias.
 * Agora integrado com a API real do backend.
 */

import api from "./api";
import { API_ENDPOINTS } from "@/config/constants";
import type { Subcategoria } from "@/types";
import type { SubCategoryResponse } from "@/types/BackendResponses";

const mapSubcategoriaResponse = (
  subcategoria: SubCategoryResponse
): Subcategoria => ({
  id: subcategoria.id,
  nome: subcategoria.description,
  descricao: subcategoria.description,
  categoriaId: subcategoria.category?.categoryCode ?? 0,
});

const normalizeSubcategoriasResponse = (
  data: SubCategoryResponse[] | { content?: SubCategoryResponse[] }
): SubCategoryResponse[] =>
  Array.isArray(data) ? data : data?.content || [];

export const subcategoriasService = {
  /**
   * Criar nova subcategoria
   * POST /subcategories
   */
  async criar(
    dados: Omit<Subcategoria, "id">
  ): Promise<Subcategoria> {
    const response = await api.post<SubCategoryResponse>(
      API_ENDPOINTS.SUBCATEGORIAS.CREATE,
      dados
    );
    return mapSubcategoriaResponse(response.data);
  },

  /**
   * Buscar subcategoria por ID
   * GET /subcategories/{id}
   */
  async buscarPorId(id: number): Promise<Subcategoria> {
    const response = await api.get<SubCategoryResponse>(
      API_ENDPOINTS.SUBCATEGORIAS.BY_ID(id)
    );
    return mapSubcategoriaResponse(response.data);
  },

  /**
   * Buscar subcategorias por nome
   * GET /subcategories/search/{name}
   */
  async buscarPorNome(
    name: string
  ): Promise<Subcategoria[]> {
    const response = await api.get<SubCategoryResponse[]>(
      API_ENDPOINTS.SUBCATEGORIAS.SEARCH_BY_NAME(name)
    );
    return normalizeSubcategoriasResponse(response.data).map(
      mapSubcategoriaResponse
    );
  },

  /**
   * Atualizar subcategoria
   * PATCH /subcategories/{id}
   */
  async atualizar(
    id: number,
    dados: Partial<Subcategoria>
  ): Promise<Subcategoria> {
    const response = await api.patch<SubCategoryResponse>(
      API_ENDPOINTS.SUBCATEGORIAS.UPDATE(id),
      dados
    );
    return mapSubcategoriaResponse(response.data);
  },

  /**
   * Deletar subcategoria
   * DELETE /subcategories/{id}
   */
  async deletar(id: number): Promise<void> {
    await api.delete(
      API_ENDPOINTS.SUBCATEGORIAS.DELETE(id)
    );
  },
};
