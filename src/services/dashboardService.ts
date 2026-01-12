/**
 * Serviço de Dashboard - Estatísticas e dados reais do sistema
 */

import api from "./api";
import { API_ENDPOINTS } from "@/config/constants";
import type { MyPage } from "@/types/BackendResponses";

export interface DashboardStats {
  totalUsuarios: number;
  totalLivros: number;
  emprestimosAtivos: number;
  reservasPendentes: number;
}

export interface AtividadeRecente {
  id: string;
  acao: string;
  usuario: string;
  timestamp: string;
  tipo: "usuario" | "livro" | "emprestimo" | "reserva";
}

export const dashboardService = {
  _isPrivileged(perfil?: string) {
    const normalized =
      typeof perfil === "string" ? perfil.toUpperCase() : "";
    return (
      normalized === "ADMIN" ||
      normalized === "BIBLIOTECARIO"
    );
  },
  _logFriendlyError(contexto: string, error: unknown) {
    console.warn(
      `Não foi possível carregar ${contexto}. Exibindo dados parciais.`,
      error
    );
  },

  _normalizeArray(data: any) {
    return Array.isArray(data) ? data : data?.content || [];
  },
  _resolveTotalCount(data: MyPage<unknown> | unknown[] | null | undefined) {
    if (Array.isArray(data)) {
      return data.length;
    }

    if (typeof data?.totalElements === "number") {
      return data.totalElements;
    }

    if (Array.isArray(data?.content)) {
      return data.content.length;
    }

    return 0;
  },
  _countPendingReserves(reservas: any[]) {
    return reservas.filter(
      (r: any) =>
        r.status === "PENDENTE" || r.status === "ATIVA"
    ).length;
  },
  async _fetchReservesByUser(): Promise<any[]> {
    const resp = await api.get(API_ENDPOINTS.RESERVAS.BY_USER);
    return this._normalizeArray(resp.data);
  },
  async _fetchReservesByBooks(books: any[]): Promise<any[]> {
    const isbns = (books || [])
      .map((book: any) => book?.isbn)
      .filter(Boolean);
    if (!isbns.length) {
      return [];
    }

    const results = await Promise.allSettled(
      isbns.map((isbn: string) =>
        api.get(API_ENDPOINTS.RESERVAS.BY_BOOK(isbn))
      )
    );

    const reservas: any[] = [];
    const failures = results.filter(
      (result) => result.status === "rejected"
    );

    results.forEach((result) => {
      if (result.status === "fulfilled") {
        reservas.push(
          ...this._normalizeArray(result.value.data)
        );
      }
    });

    if (failures.length === results.length) {
      throw failures[0];
    }

    return reservas;
  },

  /**
   * Classifica um array de empréstimos em devolvidos, atrasados e em dia.
   */
  _classifyLoans(loans: any[]) {
    const now = new Date();
    let devolvidos = 0;
    let atrasados = 0;
    let emDia = 0;

    (loans || []).forEach((l: any) => {
      if (l.returnDate) {
        devolvidos += 1;
        return;
      }
      const expected = l.expectedReturnDate
        ? new Date(l.expectedReturnDate)
        : null;
      if (expected && expected.getTime() < now.getTime()) {
        atrasados += 1;
      } else {
        emDia += 1;
      }
    });

    return {
      devolvidos,
      atrasados,
      emDia,
      ativos: atrasados + emDia,
    };
  },

  /**
   * Filtra empréstimos por categoria: 'devolvidos' | 'atrasados' | 'emdia' | 'ativos'
   */
  filterLoans(loans: any[], filter: string) {
    if (!Array.isArray(loans)) return [];
    const now = new Date();
    switch ((filter || "").toLowerCase()) {
      case "devolvidos":
        return loans.filter((l: any) => !!l.returnDate);
      case "atrasados":
        return loans.filter((l: any) => {
          if (l.returnDate) return false;
          const expected = l.expectedReturnDate
            ? new Date(l.expectedReturnDate)
            : null;
          return (
            expected && expected.getTime() < now.getTime()
          );
        });
      case "emdia":
      case "em dia":
        return loans.filter((l: any) => {
          if (l.returnDate) return false;
          const expected = l.expectedReturnDate
            ? new Date(l.expectedReturnDate)
            : null;
          return (
            !expected || expected.getTime() >= now.getTime()
          );
        });
      case "ativos":
        return loans.filter((l: any) => !l.returnDate);
      default:
        return loans;
    }
  },
  /**
   * Buscar estatísticas gerais do sistema
   */
  async getStats(perfil?: string): Promise<DashboardStats> {
    const fallback: DashboardStats = {
      totalUsuarios: 0,
      totalLivros: 0,
      emprestimosAtivos: 0,
      reservasPendentes: 0,
    };

    try {
      const isPrivileged = this._isPrivileged(perfil);
      let totalUsuarios = 0;
      let totalLivros = 0;
      let emprestimosAtivos = 0;
      let reservasPendentes = 0;

      // Buscar total de usuários
      try {
        if (isPrivileged) {
          const usuariosResponse = await api.get<
            MyPage<unknown> | unknown[]
          >(
            API_ENDPOINTS.USUARIOS.ALL
          );
          totalUsuarios = this._resolveTotalCount(
            usuariosResponse.data
          );
        } else {
          const usuarioResponse = await api.get(
            API_ENDPOINTS.USUARIOS.ME
          );
          totalUsuarios = usuarioResponse.data ? 1 : 0;
        }
      } catch (error) {
        this._logFriendlyError("total de usuários", error);
      }

      let livrosArray: any[] = [];

      // Buscar total de livros
      try {
        const livrosResponse = await api.get(
          API_ENDPOINTS.LIVROS.BASE
        );
        const livrosData = livrosResponse.data;
        livrosArray = this._normalizeArray(livrosData);
        totalLivros =
          livrosData?.totalElements ||
          livrosArray.length ||
          0;
      } catch (error) {
        this._logFriendlyError("total de livros", error);
      }

      // Buscar empréstimos do usuário logado (GET /loans/users)
      try {
        const emprestimosResponse = await api.get(
          API_ENDPOINTS.EMPRESTIMOS.BY_USER
        );
        const emprestimosArray = Array.isArray(
          emprestimosResponse?.data
        )
          ? emprestimosResponse?.data
          : emprestimosResponse?.data?.content || [];
        const counts =
          this._classifyLoans(emprestimosArray);
        emprestimosAtivos = counts.ativos;
      } catch (error) {
        this._logFriendlyError(
          "empréstimos ativos",
          error
        );
      }

      // Buscar reservas do usuário logado
      // Endpoint: GET /reserves/users ou GET /reserves/books/{isbn}
      try {
        let reservasArray: any[] = [];

        if (isPrivileged) {
          try {
            reservasArray =
              await this._fetchReservesByBooks(livrosArray);
            if (!reservasArray.length) {
              throw new Error(
                "Sem dados de reservas globais para livros."
              );
            }
          } catch (error) {
            console.warn(
              "Estatísticas globais de reservas indisponíveis. Usando reservas do usuário autenticado.",
              error
            );
            reservasArray = await this._fetchReservesByUser();
          }
        } else {
          reservasArray = await this._fetchReservesByUser();
        }

        reservasPendentes =
          this._countPendingReserves(reservasArray);
      } catch (error) {
        this._logFriendlyError(
          "reservas pendentes",
          error
        );
      }

      return {
        totalUsuarios,
        totalLivros,
        emprestimosAtivos,
        reservasPendentes,
      };
    } catch (error) {
      this._logFriendlyError(
        "estatísticas do dashboard",
        error
      );
      return fallback;
    }
  },

  /**
   * Buscar estatísticas globais do sistema (usuários com privilégio)
   */
  async getStatsGlobal(): Promise<DashboardStats> {
    return this.getStats("ADMIN");
  },

  /**
   * Buscar atividades recentes (simulado por enquanto)
   * TODO: Implementar endpoint de auditoria no backend
   */
  async getAtividadesRecentes(
    perfil?: string
  ): Promise<
    AtividadeRecente[]
  > {
    try {
      // Como não há endpoint de auditoria, vamos buscar dados recentes
      const atividades: AtividadeRecente[] = [];

      const emprestimosResponse = await api.get(
        API_ENDPOINTS.EMPRESTIMOS.BY_USER
      );
      const emprestimosArray = Array.isArray(
        emprestimosResponse?.data
      )
        ? emprestimosResponse?.data
        : emprestimosResponse?.data?.content || [];
      emprestimosArray.slice(0, 2).forEach((emp: any) => {
        atividades.push({
          id: `emp-${emp.loanCode || emp.id}`,
          acao: "Empréstimo realizado",
          usuario:
            emp.userName || emp.userId || "Usuário",
          timestamp:
            emp.loanDate || new Date().toISOString(),
          tipo: "emprestimo",
        });
      });

      // Buscar reservas recentes do usuário autenticado
      try {
        const reservasArray = await this._fetchReservesByUser();
        reservasArray.slice(0, 2).forEach((res: any) => {
          atividades.push({
            id: `res-${res.id}`,
            acao:
              res.status === "ATIVA"
                ? "Reserva aprovada"
                : "Reserva criada",
            usuario: res.userName || res.userId || "Usuário",
            timestamp:
              res.reservationDate ||
              new Date().toISOString(),
            tipo: "reserva",
          });
        });
      } catch (error) {
        this._logFriendlyError("reservas recentes", error);
      }

      // Ordenar por timestamp (mais recente primeiro)
      atividades.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() -
          new Date(a.timestamp).getTime()
      );

      return atividades.slice(0, 4);
    } catch (error) {
      this._logFriendlyError(
        "atividades recentes",
        error
      );
      return [];
    }
  },

  /**
   * Atividades recentes globais (para admins/bibliotecários)
   */
  async getAtividadesRecentesGlobal(): Promise<
    AtividadeRecente[]
  > {
    return this.getAtividadesRecentes("ADMIN");
  },

  /**
   * Formatar timestamp para exibição
   */
  formatarTempo(timestamp: string): string {
    const agora = new Date();
    const data = new Date(timestamp);
    const diffMs = agora.getTime() - data.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHoras = Math.floor(diffMs / 3600000);
    const diffDias = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "agora mesmo";
    if (diffMins < 60)
      return `há ${diffMins} minuto${
        diffMins > 1 ? "s" : ""
      }`;
    if (diffHoras < 24)
      return `há ${diffHoras} hora${
        diffHoras > 1 ? "s" : ""
      }`;
    if (diffDias < 7)
      return `há ${diffDias} dia${diffDias > 1 ? "s" : ""}`;

    return data.toLocaleDateString("pt-BR");
  },
};
