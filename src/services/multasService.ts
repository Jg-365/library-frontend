/**
 * Serviço de Multas - Consumindo API real
 *
 * Este serviço centraliza todas as operações relacionadas a multas.
 * Agora integrado com a API real do backend.
 */

import api from "./api";
import { API_ENDPOINTS } from "@/config/constants";
import type { Multa } from "@/types";

export const multasService = {
  /**
   * Buscar multa por ID
   * GET /fines/{id}
   */
  async buscarPorId(id: number): Promise<Multa> {
    const response = await api.get<Multa>(
      API_ENDPOINTS.MULTAS.BY_ID(id)
    );
    return response.data;
  },

  /**
   * Pagar uma multa
   * PATCH /fines/pay/{id}
   */
  async pagar(id: number): Promise<Multa> {
    const response = await api.patch<Multa>(
      API_ENDPOINTS.MULTAS.PAY(id)
    );
    return response.data;
  },

  /**
   * Obter multas pendentes do usuário atual
   * GET /fines/user/pending
   */
  async obterPendentes(): Promise<Multa[]> {
    const response = await api.get<Multa[]>(
      API_ENDPOINTS.MULTAS.USER_PENDING
    );
    return response.data;
  },

  /**
   * Obter multas pendentes por ID de usuário
   * GET /fines/user/pending/{userId}
   */
  async obterPendentesPorUsuario(
    userId: string
  ): Promise<Multa[]> {
    const response = await api.get<Multa[]>(
      API_ENDPOINTS.MULTAS.USER_PENDING_BY_ID(userId)
    );
    return response.data;
  },

  /**
   * Obter multas pagas do usuário atual
   * GET /fines/user/paid
   */
  async obterPagas(): Promise<Multa[]> {
    const response = await api.get<Multa[]>(
      API_ENDPOINTS.MULTAS.USER_PAID
    );
    return response.data;
  },

  /**
   * Obter multas pagas por ID de usuário
   * GET /fines/user/paid/{userId}
   */
  async obterPagasPorUsuario(
    userId: string
  ): Promise<Multa[]> {
    const response = await api.get<Multa[]>(
      API_ENDPOINTS.MULTAS.USER_PAID_BY_ID(userId)
    );
    return response.data;
  },
};
