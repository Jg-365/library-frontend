/**
 * Serviço de Categorias - Consumindo API real
 *
 * Este serviço centraliza todas as operações relacionadas a categorias.
 * Integrado com a API real do backend.
 */

import api from "./api";
import { API_ENDPOINTS } from "@/config/constants";
import type { Categoria } from "@/types";

export const categoriasService = {
  /**
   * Listar/Buscar todas as categorias
   * GET /categories
   */
  async listarTodas(): Promise<Categoria[]> {
    const response = await api.get<Categoria[]>(
      API_ENDPOINTS.CATEGORIAS.SEARCH
    );
    return response.data;
  },

  /**
   * Buscar categoria por ID
   * GET /categories/{id}
   */
  async buscarPorId(id: number): Promise<Categoria> {
    const response = await api.get<Categoria>(
      API_ENDPOINTS.CATEGORIAS.BY_ID(id)
    );
    return response.data;
  },

  /**
   * Criar nova categoria
   * POST /categories
   */
  async criar(
    dados: Omit<Categoria, "id">
  ): Promise<Categoria> {
    const response = await api.post<Categoria>(
      API_ENDPOINTS.CATEGORIAS.CREATE,
      dados
    );
    return response.data;
  },

  /**
   * Atualizar categoria existente
   * PATCH /categories/{id}
   */
  async atualizar(
    id: number,
    dados: Partial<Categoria>
  ): Promise<Categoria> {
    const response = await api.patch<Categoria>(
      API_ENDPOINTS.CATEGORIAS.UPDATE(id),
      dados
    );
    return response.data;
  },

  /**
   * Deletar categoria
   * DELETE /categories/{id}
   */
  async deletar(id: number): Promise<void> {
    await api.delete(API_ENDPOINTS.CATEGORIAS.DELETE(id));
  },
};
