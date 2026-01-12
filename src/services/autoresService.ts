/**
 * Serviço de Autores - Consumindo API real
 *
 * Este serviço centraliza todas as operações relacionadas a autores.
 * Integrado com a API real do backend.
 */

import api from "./api";
import { API_ENDPOINTS } from "@/config/constants";
import type { Autor } from "@/types";

export interface AutorPayload {
  name: string;
  email: string;
  nationality: string;
}

function mapAutorResponse(
  autor: any,
  index: number
): Autor {
  return {
    id:
      autor?.id ??
      autor?.authorId ??
      autor?.codigo ??
      index,
    nome: autor?.name ?? autor?.nome ?? "",
    email: autor?.email ?? "",
    nacionalidade:
      autor?.nationality ?? autor?.nacionalidade ?? "",
  };
}

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
   * GET /authors?authorName=...
   */
  async buscarPorNome(name?: string): Promise<Autor[]> {
    const params = name
      ? `?authorName=${encodeURIComponent(name)}`
      : "";
    const response = await api.get(
      `${API_ENDPOINTS.AUTORES.BY_NAME}${params}`
    );
    return (response.data || []).map(
      (autor: any, index: number) =>
        mapAutorResponse(autor, index)
    );
  },

  /**
   * Buscar autor por email
   * GET /authors/{email}
   */
  async buscarPorEmail(email: string): Promise<Autor> {
    const response = await api.get(
      API_ENDPOINTS.AUTORES.BY_EMAIL(email)
    );
    return mapAutorResponse(response.data, 0);
  },

  /**
   * Criar novo autor
   * POST /authors
   */
  async criar(dados: AutorPayload): Promise<Autor> {
    const response = await api.post(
      API_ENDPOINTS.AUTORES.CREATE,
      dados
    );
    return mapAutorResponse(response.data, 0);
  },

  /**
   * Atualizar autor existente
   * PATCH /authors/{email}
   */
  async atualizar(
    email: string,
    dados: Partial<AutorPayload>
  ): Promise<Autor> {
    const response = await api.patch(
      API_ENDPOINTS.AUTORES.UPDATE(email),
      dados
    );
    return mapAutorResponse(response.data, 0);
  },

  /**
   * Deletar autor
   * DELETE /authors/{email}
   */
  async deletar(email: string): Promise<void> {
    await api.delete(API_ENDPOINTS.AUTORES.DELETE(email));
  },
};

