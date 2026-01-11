/**
 * Serviço de Telefones - Consumindo API real
 *
 * Este serviço centraliza todas as operações relacionadas a telefones de usuários.
 * Integrado com a API real do backend.
 */

import api from "./api";
import { API_ENDPOINTS } from "@/config/constants";

interface TelefoneBackend {
  id: number;
  number: string;
  tipo?: string;
  ownerId?: string;
  // Adicione outros campos conforme necessário
}

interface Telefone {
  id: number;
  numero: string;
  tipo?: string;
  usuarioId?: string;
  // Adicione outros campos conforme necessário
}

const mapTelefoneFromBackend = (
  telefone: TelefoneBackend
): Telefone => ({
  id: telefone.id,
  numero: telefone.number,
  tipo: telefone.tipo,
  usuarioId: telefone.ownerId,
});

const mapTelefoneToBackend = (dados: {
  numero: string;
  tipo?: string;
  usuarioId?: string;
}): {
  number: string;
  tipo?: string;
  ownerId?: string;
} => ({
  number: dados.numero,
  tipo: dados.tipo,
  ownerId: dados.usuarioId,
});

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
    const response = await api.post<TelefoneBackend>(
      API_ENDPOINTS.TELEFONES.CREATE,
      mapTelefoneToBackend(dados)
    );
    return mapTelefoneFromBackend(response.data);
  },

  /**
   * Atualizar telefone
   * PATCH /phones/{id}
   */
  async atualizar(
    id: number,
    dados: { numero?: string; tipo?: string }
  ): Promise<Telefone> {
    const response = await api.patch<TelefoneBackend>(
      API_ENDPOINTS.TELEFONES.UPDATE(id),
      {
        number: dados.numero,
        tipo: dados.tipo,
      }
    );
    return mapTelefoneFromBackend(response.data);
  },

  /**
   * Deletar telefone
   * DELETE /phones/{id}
   */
  async deletar(id: number): Promise<void> {
    await api.delete(API_ENDPOINTS.TELEFONES.DELETE(id));
  },
};
