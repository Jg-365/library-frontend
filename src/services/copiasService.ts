/**
 * Serviço de Cópias - Consumindo API real
 *
 * Este serviço centraliza todas as operações relacionadas a cópias físicas de livros.
 * Integrado com a API real do backend.
 */

import api from "./api";
import { API_ENDPOINTS } from "@/config/constants";
import type { Copia } from "@/types/Copia";

export const copiasService = {
  /**
   * Registrar nova cópia
   * POST /copies
   */
  async criar(dados: {
    isbn: string;
    status?: string;
  }): Promise<Copia> {
    const response = await api.post<Copia>(
      API_ENDPOINTS.COPIAS.CREATE,
      dados
    );
    return response.data;
  },

  /**
   * Buscar cópia por ID (sequential e ISBN)
   * GET /copies/{sequential}/{isbn}
   */
  async buscarPorId(
    sequential: number,
    isbn: string
  ): Promise<Copia> {
    const response = await api.get<Copia>(
      API_ENDPOINTS.COPIAS.BY_ID(sequential, isbn)
    );
    return response.data;
  },

  /**
   * Atualizar status da cópia
   * PATCH /copies/{sequential}
   */
  async atualizar(
    sequential: number,
    dados: { status: string }
  ): Promise<Copia> {
    const response = await api.patch<Copia>(
      API_ENDPOINTS.COPIAS.UPDATE(sequential),
      dados
    );
    return response.data;
  },

  /**
   * Deletar cópia
   * DELETE /copies/{sequential}/{isbn}
   */
  async deletar(
    sequential: number,
    isbn: string
  ): Promise<void> {
    await api.delete(
      API_ENDPOINTS.COPIAS.DELETE(sequential, isbn)
    );
  },

  /**
   * Buscar cópias por status e ISBN
   * GET /copies/status/{isbn}
   */
  async buscarPorStatus(isbn: string): Promise<Copia[]> {
    const response = await api.get<Copia[]>(
      API_ENDPOINTS.COPIAS.BY_STATUS(isbn)
    );
    return response.data;
  },

  /**
   * Listar todas as cópias de um livro (ISBN)
   * GET /copies/all/{isbn}
   */
  async listarPorIsbn(isbn: string): Promise<Copia[]> {
    const response = await api.get<Copia[]>(
      API_ENDPOINTS.COPIAS.ALL_BY_ISBN(isbn)
    );
    return response.data;
  },
};
