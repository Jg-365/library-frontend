/**
 * Serviço de Multas - Consumindo API real
 *
 * Este serviço centraliza todas as operações relacionadas a multas.
 * Agora integrado com a API real do backend.
 */

import api from "./api";
import { API_ENDPOINTS } from "@/config/constants";
import { authService } from "./authService";
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
  const fineId =
    "id" in fine
      ? fine.id
      : (fine as any).fineId ?? fine.loanId ?? 0;
  const bookTitles =
    "bookTitles" in fine
      ? fine.bookTitles
      : (fine as any).bookTitles ?? [];

  return {
    id: fineId,
    emprestimoId: fine.loanId ?? 0,
    valor: fine.value,
    diasAtraso: fine.daysOverdue,
    titulosLivros: bookTitles,
    motivoMulta: formatMotivoMulta(fine.daysOverdue),
    dataCriacao: paymentDate || undefined,
    pago,
    dataPagamento: paymentDate || undefined,
  };
};

const normalizeFineList = <T>(
  data: T[] | { content?: T[] } | null | undefined
): T[] => {
  if (Array.isArray(data)) return data;
  return data?.content ?? [];
};

const resolveUserEnrollment = async (): Promise<
  string | undefined
> => {
  const stored = authService.getStoredAuth();
  if (stored?.user?.enrollment) {
    return String(stored.user.enrollment);
  }

  try {
    const response = await api.get(API_ENDPOINTS.USUARIOS.ME);
    const enrollment =
      response.data?.enrollment ?? response.data?.matricula;
    if (enrollment) {
      return String(enrollment);
    }
  } catch {
    return undefined;
  }

  return undefined;
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
    try {
      const response = await api.get<
        PendingFineResponse[] | { content?: PendingFineResponse[] }
      >(
        API_ENDPOINTS.MULTAS.USER_PENDING
      );
      return normalizeFineList(response.data).map((fine) =>
        mapFineResponseToMulta(fine, { pago: false })
      );
    } catch (error: any) {
      if (error?.response?.status !== 404) {
        throw error;
      }
      const enrollment = await resolveUserEnrollment();
      if (!enrollment) {
        throw error;
      }
      const response = await api.get<
        PendingFineResponse[] | { content?: PendingFineResponse[] }
      >(
        API_ENDPOINTS.MULTAS.USER_PENDING_BY_ID(enrollment)
      );
      return normalizeFineList(response.data).map((fine) =>
        mapFineResponseToMulta(fine, { pago: false })
      );
    }
  },

  /**
   * Obter multas pendentes por ID de usuário
   * GET /fines/user/pending/{userId}
   */
  async obterPendentesPorUsuario(
    userId: string
  ): Promise<Multa[]> {
    const response = await api.get<
      PendingFineResponse[] | { content?: PendingFineResponse[] }
    >(
      API_ENDPOINTS.MULTAS.USER_PENDING_BY_ID(userId)
    );
    return normalizeFineList(response.data).map((fine) =>
      mapFineResponseToMulta(fine, { pago: false })
    );
  },

  /**
   * Obter multas pagas do usuário atual
   * GET /fines/user/paid
   */
  async obterPagas(): Promise<Multa[]> {
    try {
      const response = await api.get<
        FineResponse[] | { content?: FineResponse[] }
      >(
        API_ENDPOINTS.MULTAS.USER_PAID
      );
      return normalizeFineList(response.data).map((fine) =>
        mapFineResponseToMulta(fine, { pago: true })
      );
    } catch (error: any) {
      if (error?.response?.status !== 404) {
        throw error;
      }
      const enrollment = await resolveUserEnrollment();
      if (!enrollment) {
        throw error;
      }
      const response = await api.get<
        FineResponse[] | { content?: FineResponse[] }
      >(
        API_ENDPOINTS.MULTAS.USER_PAID_BY_ID(enrollment)
      );
      return normalizeFineList(response.data).map((fine) =>
        mapFineResponseToMulta(fine, { pago: true })
      );
    }
  },

  /**
   * Obter multas pagas por ID de usuário
   * GET /fines/user/paid/{userId}
   */
  async obterPagasPorUsuario(
    userId: string
  ): Promise<Multa[]> {
    const response = await api.get<
      FineResponse[] | { content?: FineResponse[] }
    >(
      API_ENDPOINTS.MULTAS.USER_PAID_BY_ID(userId)
    );
    return normalizeFineList(response.data).map((fine) =>
      mapFineResponseToMulta(fine, { pago: true })
    );
  },
};

