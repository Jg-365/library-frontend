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
  /**
   * Buscar estatísticas gerais do sistema
   */
  async getStats(): Promise<DashboardStats> {
    try {
      // Buscar total de usuários
      const usuariosResponse = await api.get(
        API_ENDPOINTS.USUARIOS.ALL
      );
      const totalUsuarios = Array.isArray(
        usuariosResponse.data
      )
        ? usuariosResponse.data.length
        : 0;

      // Buscar total de livros
      const livrosResponse = await api.get(
        API_ENDPOINTS.LIVROS.BASE
      );
      const totalLivros =
        livrosResponse.data?.totalElements ||
        livrosResponse.data?.content?.length ||
        0;

      // Buscar empréstimos do usuário logado
      // Nota: Backend não tem endpoint para TODOS os empréstimos
      // Apenas empréstimos do usuário autenticado
      const emprestimosResponse = await api.get(
        API_ENDPOINTS.EMPRESTIMOS.BY_USER
      );
      const emprestimosAtivos = Array.isArray(
        emprestimosResponse.data
      )
        ? emprestimosResponse.data.filter(
            (e: any) =>
              e.status === "ATIVO" || !e.returnDate
          ).length
        : 0;

      // Buscar reservas do usuário logado
      // Endpoint: GET /reserves/users
      const reservasResponse = await api.get(
        API_ENDPOINTS.RESERVAS.BY_USER
      );
      const reservasPendentes = Array.isArray(
        reservasResponse.data
      )
        ? reservasResponse.data.filter(
            (r: any) =>
              r.status === "PENDENTE" ||
              r.status === "ATIVA"
          ).length
        : 0;

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
   * Buscar atividades recentes (simulado por enquanto)
   * TODO: Implementar endpoint de auditoria no backend
   */
  async getAtividadesRecentes(): Promise<
    AtividadeRecente[]
  > {
    try {
      // Como não há endpoint de auditoria, vamos buscar dados recentes
      const atividades: AtividadeRecente[] = [];

      // Buscar empréstimos recentes do usuário
      const emprestimosResponse = await api.get(
        API_ENDPOINTS.EMPRESTIMOS.BY_USER
      );
      if (Array.isArray(emprestimosResponse.data)) {
        emprestimosResponse.data
          .slice(0, 2)
          .forEach((emp: any) => {
            atividades.push({
              id: `emp-${emp.id}`,
              acao: "Empréstimo realizado",
              usuario: emp.userName || "Usuário",
              timestamp:
                emp.loanDate || new Date().toISOString(),
              tipo: "emprestimo",
            });
          });
      }

      // Buscar reservas recentes
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
              usuario: res.userName || "Usuário",
              timestamp:
                res.reservationDate ||
                new Date().toISOString(),
              tipo: "reserva",
            });
          });
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
