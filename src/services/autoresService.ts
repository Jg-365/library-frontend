/**
 * Serviço de Autores - Consumindo API real
 *
 * Este serviço centraliza todas as operações relacionadas a autores.
 * Integrado com a API real do backend.
 */

import api from "./api";
import { API_ENDPOINTS } from "@/config/constants";
import type { Autor } from "@/types";

export const autoresService = {
  /**
   * Listar todos os autores
   * GET /authors/all
   */
  async listarTodos(): Promise<Autor[]> {
    const response = await api.get<Autor[]>(
      API_ENDPOINTS.AUTORES.ALL
    );
    return response.data.map((autor, index) => ({
      id: autor.id || (autor as any).authorId || index + 1,
      nome: autor.nome || (autor as any).name,
      email: autor.email,
      nacionalidade:
        autor.nacionalidade || (autor as any).nationality,
    }));
  },
  /**
   * Buscar autores por nome
   * GET /authors?name=...
   */
  async buscarPorNome(name?: string): Promise<Autor[]> {
    const params = name
      ? `?name=${encodeURIComponent(name)}`
      : "";
    const response = await api.get<Autor[]>(
      `${API_ENDPOINTS.AUTORES.BY_NAME}${params}`
    );
    return response.data;
  },

  /**
   * Buscar autor por email
   * GET /authors/{email}
   */
  async buscarPorEmail(email: string): Promise<Autor> {
    const response = await api.get<Autor>(
      API_ENDPOINTS.AUTORES.BY_EMAIL(email)
    );
    return response.data;
  },

  /**
   * Criar novo autor
   * POST /authors
   */
  async criar(dados: Omit<Autor, "id">): Promise<Autor> {
    const response = await api.post<Autor>(
      API_ENDPOINTS.AUTORES.CREATE,
      dados
    );
    return response.data;
  },

  /**
   * Atualizar autor existente
   * PATCH /authors/{email}
   */
  async atualizar(
    email: string,
    dados: Partial<Autor>
  ): Promise<Autor> {
    const response = await api.patch<Autor>(
      API_ENDPOINTS.AUTORES.UPDATE(email),
      dados
    );
    return response.data;
  },

  /**
   * Deletar autor
   * DELETE /authors/{email}
   */
  async deletar(email: string): Promise<void> {
    await api.delete(API_ENDPOINTS.AUTORES.DELETE(email));
  },
};
