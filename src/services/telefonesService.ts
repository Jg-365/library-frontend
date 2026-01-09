/**
 * Serviço de Telefones - Consumindo API real
 *
 * Este serviço centraliza todas as operações relacionadas a telefones de usuários.
 * Integrado com a API real do backend.
 */

import api from "./api";
import { API_ENDPOINTS } from "@/config/constants";

interface Telefone {
  id: number;
  numero: string;
  tipo?: string;
  usuarioId?: string;
  // Adicione outros campos conforme necessário
}

export const telefonesService = {
  /**
   * Adicionar novo telefone
   * POST /phones
   */
  async criar(dados: {
    numero: string;
    tipo?: string;
    usuarioId?: string;
  }): Promise<Telefone> {
    const response = await api.post<Telefone>(
      API_ENDPOINTS.TELEFONES.CREATE,
      dados
    );
    return response.data;
  },

  /**
   * Atualizar telefone
   * PATCH /phones/{id}
   */
  async atualizar(
    id: number,
    dados: { numero?: string; tipo?: string }
  ): Promise<Telefone> {
    const response = await api.patch<Telefone>(
      API_ENDPOINTS.TELEFONES.UPDATE(id),
      dados
    );
    return response.data;
  },

  /**
   * Deletar telefone
   * DELETE /phones/{id}
   */
  async deletar(id: number): Promise<void> {
    await api.delete(API_ENDPOINTS.TELEFONES.DELETE(id));
  },
};
