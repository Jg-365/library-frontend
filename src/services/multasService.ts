/**
 * Serviço de Multas - Consumindo API real
 *
 * Este serviço centraliza todas as operações relacionadas a multas.
 * Agora integrado com a API real do backend.
 */

import api from "./api";
import { API_ENDPOINTS } from "@/config/constants";
import type { Multa } from "@/types";
import type {
  FineResponse,
  PendingFineResponse,
} from "@/types/BackendResponses";

const formatMotivoMulta = (diasAtraso: number) =>
  `Atraso de ${diasAtraso} ${
    diasAtraso === 1 ? "dia" : "dias"
  }`;

const mapFineResponseToMulta = (
  fine: FineResponse | PendingFineResponse,
  options?: { pago?: boolean }
): Multa => {
  const paymentDate =
    "paymentDate" in fine ? fine.paymentDate : null;
  const pago =
    options?.pago !== undefined
      ? options.pago
      : Boolean(paymentDate);

  return {
    id: fine.id,
    emprestimoId: fine.loanId,
    valor: fine.value,
    diasAtraso: fine.daysOverdue,
    titulosLivros: fine.bookTitles,
    motivoMulta: formatMotivoMulta(fine.daysOverdue),
    dataCriacao:
      paymentDate ||
      new Date().toISOString().split("T")[0],
    pago,
    dataPagamento: paymentDate || undefined,
  };
};

export const multasService = {
  /**
   * Buscar multa por ID
   * GET /fines/{id}
   */
  async buscarPorId(id: number): Promise<Multa> {
    const response = await api.get<FineResponse>(
      API_ENDPOINTS.MULTAS.BY_ID(id)
    );
    return mapFineResponseToMulta(response.data);
  },

  /**
   * Pagar uma multa
   * PATCH /fines/pay/{id}
   */
  async pagar(id: number): Promise<Multa> {
    const response = await api.patch<FineResponse>(
      API_ENDPOINTS.MULTAS.PAY(id)
    );
    return mapFineResponseToMulta(response.data, {
      pago: true,
    });
  },

  /**
   * Obter multas pendentes do usuário atual
   * GET /fines/user/pending
   */
  async obterPendentes(): Promise<Multa[]> {
    const response = await api.get<PendingFineResponse[]>(
      API_ENDPOINTS.MULTAS.USER_PENDING
    );
    return response.data.map((fine) =>
      mapFineResponseToMulta(fine, { pago: false })
    );
  },

  /**
   * Obter multas pendentes por ID de usuário
   * GET /fines/user/pending/{userId}
   */
  async obterPendentesPorUsuario(
    userId: string
  ): Promise<Multa[]> {
    const response = await api.get<PendingFineResponse[]>(
      API_ENDPOINTS.MULTAS.USER_PENDING_BY_ID(userId)
    );
    return response.data.map((fine) =>
      mapFineResponseToMulta(fine, { pago: false })
    );
  },

  /**
   * Obter multas pagas do usuário atual
   * GET /fines/user/paid
   */
  async obterPagas(): Promise<Multa[]> {
    const response = await api.get<FineResponse[]>(
      API_ENDPOINTS.MULTAS.USER_PAID
    );
    return response.data.map((fine) =>
      mapFineResponseToMulta(fine, { pago: true })
    );
  },

  /**
   * Obter multas pagas por ID de usuário
   * GET /fines/user/paid/{userId}
   */
  async obterPagasPorUsuario(
    userId: string
  ): Promise<Multa[]> {
    const response = await api.get<FineResponse[]>(
      API_ENDPOINTS.MULTAS.USER_PAID_BY_ID(userId)
    );
    return response.data.map((fine) =>
      mapFineResponseToMulta(fine, { pago: true })
    );
  },
};
