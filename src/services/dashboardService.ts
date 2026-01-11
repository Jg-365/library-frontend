/**
 * Serviço de Dashboard - Estatísticas e dados reais do sistema
 */

import api from "./api";
import { API_ENDPOINTS } from "@/config/constants";

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
  // Cache whether the backend supports GET /reserves to avoid repeated 405s
  _reservesSupported: null as boolean | null,
  _isPrivileged(perfil?: string) {
    return perfil === "ADMIN" || perfil === "BIBLIOTECARIO";
  },

  /**
   * Fallback: agregação de reservas por usuário quando GET /reserves não está disponível.
   * Consulta todos os usuários e chama GET /reserves/users?userEnrollment={enrollment}
   */
  async _fetchReservesByAllUsers(): Promise<any[]> {
    try {
      const resp = await api.get(
        API_ENDPOINTS.RESERVAS.BY_USER
      );
      const reservasArray = Array.isArray(resp.data)
        ? resp.data
        : resp.data?.content || [];
      return reservasArray;
    } catch (err) {
      console.error(
        "Erro ao agregar reservas por usuário:",
        err
      );
      return [];
    }
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
    try {
      const isPrivileged = this._isPrivileged(perfil);
      // Buscar total de usuários
      let totalUsuarios = 0;
      if (isPrivileged) {
        const usuariosResponse = await api.get(
          API_ENDPOINTS.USUARIOS.ALL
        );
        totalUsuarios = Array.isArray(usuariosResponse.data)
          ? usuariosResponse.data.length
          : 0;
      } else {
        const usuarioResponse = await api.get(
          API_ENDPOINTS.USUARIOS.ME
        );
        totalUsuarios = usuarioResponse.data ? 1 : 0;
      }

      // Buscar total de livros
      const livrosResponse = await api.get(
        API_ENDPOINTS.LIVROS.BASE
      );
      const totalLivros =
        livrosResponse.data?.totalElements ||
        livrosResponse.data?.content?.length ||
        0;

      // Buscar empréstimos do usuário logado ou globais (admin/bibliotecário)
      const emprestimosResponse = await api.get(
        isPrivileged
          ? API_ENDPOINTS.EMPRESTIMOS.BASE
          : API_ENDPOINTS.EMPRESTIMOS.BY_USER
      );
      const emprestimosArray = Array.isArray(
        emprestimosResponse.data
      )
        ? emprestimosResponse.data
        : emprestimosResponse.data?.content || [];
      const counts = this._classifyLoans(emprestimosArray);
      const emprestimosAtivos = counts.ativos;

      // Buscar reservas do usuário logado
      // Endpoint: GET /reserves/users
      let reservasPendentes = 0;
      if (isPrivileged) {
        if (this._reservesSupported === false) {
          const aggregated =
            await this._fetchReservesByAllUsers();
          reservasPendentes = Array.isArray(aggregated)
            ? aggregated.filter(
                (r: any) =>
                  r.status === "PENDENTE" ||
                  r.status === "ATIVA"
              ).length
            : 0;
        } else {
          try {
            const reservasResponse = await api.get(
              API_ENDPOINTS.RESERVAS.BASE
            );
            const reservasArray = Array.isArray(
              reservasResponse.data
            )
              ? reservasResponse.data
              : reservasResponse.data?.content || [];
            reservasPendentes = reservasArray.filter(
              (r: any) =>
                r.status === "PENDENTE" ||
                r.status === "ATIVA"
            ).length;
            this._reservesSupported = true;
          } catch (err: any) {
            if (err?.response?.status === 405) {
              console.warn(
                "GET /reserves não permitido pelo backend - pulando estatísticas de reservas globais"
              );
              this._reservesSupported = false;
            } else {
              console.error(
                "Erro ao buscar reservas globais:",
                err
              );
            }
          }
        }
      } else {
        const reservasResponse = await api.get(
          API_ENDPOINTS.RESERVAS.BY_USER
        );
        reservasPendentes = Array.isArray(
          reservasResponse.data
        )
          ? reservasResponse.data.filter(
              (r: any) =>
                r.status === "PENDENTE" ||
                r.status === "ATIVA"
            ).length
          : 0;
      }

      return {
        totalUsuarios,
        totalLivros,
        emprestimosAtivos,
        reservasPendentes,
      };
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error);
      return {
        totalUsuarios: 0,
        totalLivros: 0,
        emprestimosAtivos: 0,
        reservasPendentes: 0,
      };
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
      const isPrivileged = this._isPrivileged(perfil);
      // Como não há endpoint de auditoria, vamos buscar dados recentes
      const atividades: AtividadeRecente[] = [];

      // Buscar empréstimos recentes do usuário
      const emprestimosResponse = await api.get(
        isPrivileged
          ? API_ENDPOINTS.EMPRESTIMOS.BASE
          : API_ENDPOINTS.EMPRESTIMOS.BY_USER
      );
      if (Array.isArray(emprestimosResponse.data)) {
        emprestimosResponse.data
          .slice(0, 2)
          .forEach((emp: any) => {
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
      }

      // Buscar reservas recentes
      if (isPrivileged) {
        if (this._reservesSupported === false) {
          const aggregated =
            await this._fetchReservesByAllUsers();
          if (Array.isArray(aggregated)) {
            aggregated.slice(0, 2).forEach((res: any) => {
              atividades.push({
                id: `res-${res.id}`,
                acao:
                  res.status === "ATIVA"
                    ? "Reserva aprovada"
                    : "Reserva criada",
                usuario:
                  res.userName || res.userId || "Usuário",
                timestamp:
                  res.reservationDate ||
                  new Date().toISOString(),
                tipo: "reserva",
              });
            });
          }
        } else {
          try {
            const reservasResponse = await api.get(
              API_ENDPOINTS.RESERVAS.BASE
            );
            const reservasArray = Array.isArray(
              reservasResponse.data
            )
              ? reservasResponse.data
              : reservasResponse.data?.content || [];
            reservasArray.slice(0, 2).forEach((res: any) => {
              atividades.push({
                id: `res-${res.id}`,
                acao:
                  res.status === "ATIVA"
                    ? "Reserva aprovada"
                    : "Reserva criada",
                usuario:
                  res.userName || res.userId || "Usuário",
                timestamp:
                  res.reservationDate ||
                  new Date().toISOString(),
                tipo: "reserva",
              });
            });
            this._reservesSupported = true;
          } catch (err: any) {
            if (err?.response?.status === 405) {
              console.warn(
                "GET /reserves não permitido pelo backend - pulando atividades de reservas globais"
              );
              this._reservesSupported = false;
            } else {
              console.error(
                "Erro ao buscar reservas globais:",
                err
              );
            }
          }
        }
      } else {
        const reservasResponse = await api.get(
          API_ENDPOINTS.RESERVAS.BY_USER
        );
        if (Array.isArray(reservasResponse.data)) {
          reservasResponse.data
            .slice(0, 2)
            .forEach((res: any) => {
              atividades.push({
                id: `res-${res.id}`,
                acao:
                  res.status === "ATIVA"
                    ? "Reserva aprovada"
                    : "Reserva criada",
                usuario:
                  res.userName || res.userId || "Usuário",
                timestamp:
                  res.reservationDate ||
                  new Date().toISOString(),
                tipo: "reserva",
              });
            });
        }
      }

      // Ordenar por timestamp (mais recente primeiro)
      atividades.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() -
          new Date(a.timestamp).getTime()
      );

      return atividades.slice(0, 4);
    } catch (error) {
      console.error(
        "Erro ao buscar atividades recentes:",
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
