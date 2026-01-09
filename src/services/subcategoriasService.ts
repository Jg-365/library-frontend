/**
 * Serviço de Subcategorias - Consumindo API real
 *
 * Este serviço centraliza todas as operações relacionadas a subcategorias.
 * Agora integrado com a API real do backend.
 */

import api from "./api";
import { API_ENDPOINTS } from "@/config/constants";
import type { Subcategoria } from "@/types";

export const subcategoriasService = {
  /**
   * Criar nova subcategoria
   * POST /subcategories
   */
  async criar(
    dados: Omit<Subcategoria, "id">
  ): Promise<Subcategoria> {
    const response = await api.post<Subcategoria>(
      API_ENDPOINTS.SUBCATEGORIAS.CREATE,
      dados
    );
    return response.data;
  },

  /**
   * Buscar subcategoria por ID
   * GET /subcategories/{id}
   */
  async buscarPorId(id: number): Promise<Subcategoria> {
    const response = await api.get<Subcategoria>(
      API_ENDPOINTS.SUBCATEGORIAS.BY_ID(id)
    );
    return response.data;
  },

  /**
   * Buscar subcategorias por nome
   * GET /subcategories/search/{name}
   */
  async buscarPorNome(
    name: string
  ): Promise<Subcategoria[]> {
    const response = await api.get<Subcategoria[]>(
      API_ENDPOINTS.SUBCATEGORIAS.SEARCH_BY_NAME(name)
    );
    return response.data;
  },

  /**
   * Atualizar subcategoria
   * PATCH /subcategories/{id}
   */
  async atualizar(
    id: number,
    dados: Partial<Subcategoria>
  ): Promise<Subcategoria> {
    const response = await api.patch<Subcategoria>(
      API_ENDPOINTS.SUBCATEGORIAS.UPDATE(id),
      dados
    );
    return response.data;
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
