/**
 * Serviço de Empréstimos - Consumindo API real
 *
 * Este serviço centraliza todas as operações relacionadas a empréstimos (loans).
 * Integrado com a API real do backend.
 */

import api from "./api";
import { API_ENDPOINTS } from "@/config/constants";
import { usuariosService } from "./usuariosService";
import { authService } from "./authService";
import type {
  Emprestimo,
  CriarEmprestimoRequest,
} from "@/types";
import type {
  LoanResponse,
  LoanRequest,
  LoanReturnResponse,
} from "@/types/BackendResponses";

/**
 * Converte LoanResponse do backend para Emprestimo do frontend
 */
async function mapLoanResponseToEmprestimo(
  loan: LoanResponse
): Promise<Emprestimo> {
  // Calcular status baseado nas datas
  let status: "ATIVO" | "DEVOLVIDO" | "ATRASADO" = "ATIVO";

  if (loan.returnDate) {
    status = "DEVOLVIDO";
  } else {
    const hoje = new Date();
    const dataPrevista = new Date(loan.expectedReturnDate);
    if (hoje > dataPrevista) {
      status = "ATRASADO";
    }
  }

  // Buscar informações dos livros pelos copyCodes
  const livros: any[] = [];

  if (loan.copyCodes && loan.copyCodes.length > 0) {
    // Extrair ISBNs dos copyCodes (formato: "isbn-sequential")
    const isbns = new Set<string>();

    for (const copyCode of loan.copyCodes) {
      // copyCode formato: "9788521207467-10"
      const parts = copyCode.split("-");
      if (parts.length === 2) {
        isbns.add(parts[0]); // ISBN é a primeira parte
      } else {
        console.warn(
          "⚠️ CopyCode formato inesperado:",
          copyCode
        );
      }
    }

    // Buscar cada livro pelo ISBN
    for (const isbn of isbns) {
      try {
        const response = await api.get(`/books/${isbn}`);
        livros.push({
          titulo:
            response.data?.title ||
            response.data?.titulo ||
            `Livro (ISBN: ${isbn})`,
          isbn: isbn,
          autores: (
            response.data?.authors ||
            response.data?.autores ||
            []
          )
            .map((a: any) => ({
              nome: a.name || a.nome || a,
            }))
            .filter(Boolean),
          imagemCapa:
            response.data?.imageUrl ||
            response.data?.imagemCapa ||
            "",
          quantidadeExemplares:
            response.data?.copies ||
            response.data?.availableCopies ||
            response.data?.quantidadeExemplares ||
            0,
        });
      } catch (error) {
        console.error(
          `❌ Erro ao buscar livro ${isbn}:`,
          error
        );
        livros.push({
          titulo: `Livro (ISBN: ${isbn})`,
          isbn: isbn,
          autores: [],
          imagemCapa: "",
          quantidadeExemplares: 0,
        });
      }
    }
  }

  return {
    id: loan.loanCode,
    usuarioId: loan.userId,
    dataInicio: loan.loanDate,
    // Compatibilidade: alguns componentes ainda usam `dataEmprestimo`
    dataEmprestimo: loan.loanDate,
    dataPrevistaDevolucao: loan.expectedReturnDate,
    dataDevolucaoReal: loan.returnDate || undefined,
    returnDate: loan.returnDate,
    copyCodes: loan.copyCodes,
    livros: livros,
    status: status,
    usuario: await (async () => {
      if (!loan.userId) return undefined;

      const stored = authService.getStoredAuth();
      const role =
        stored?.user?.role ??
        stored?.user?.perfil ??
        null;
      const canFetchUserDetails =
        role === "ADMIN" || role === "BIBLIOTECARIO";

      if (!canFetchUserDetails) {
        return {
          enrollment: loan.userId,
        } as any;
      }

      try {
        const fetched =
          await usuariosService.buscarPorEnrollment(
            String(loan.userId)
          );
        return {
          enrollment: fetched.enrollment || loan.userId,
          nome:
            (fetched as any).nome ||
            fetched.name ||
            fetched.username ||
            undefined,
          name:
            fetched.name ||
            (fetched as any).nome ||
            fetched.username ||
            undefined,
          username:
            fetched.username ||
            String(fetched.enrollment ?? loan.userId),
          address: fetched.address || "",
          userType:
            (fetched as any).userType || "FUNCIONARIO",
          role: (fetched as any).role || "USUARIO",
          active: fetched.active ?? true,
        } as any;
      } catch (err: any) {
        const status = err?.response?.status;
        if (status === 403 || status === 400) {
          console.warn(
            `[emprestimosService] acesso negado ao usuário ${loan.userId}, usando dados mínimos.`
          );
          return {
            enrollment: loan.userId,
          } as any;
        }
        console.warn(
          `[emprestimosService] falha ao buscar usuário ${loan.userId}, usando placeholder`,
          err
        );
        return {
          enrollment: loan.userId,
        } as any;
      }
    })(),
  };
}

export const emprestimosService = {
  /**
   * Criar novo empréstimo (usuário autenticado)
   * POST /loans/user
   */
  async criar(
    dados: CriarEmprestimoRequest
  ): Promise<Emprestimo> {
    const request: LoanRequest = {
      isbnCodes: dados.isbnCodes,
    };
    // DEBUG: log token/header state to troubleshoot 401 Unauthorized
    try {
      const storedToken =
        localStorage.getItem("auth-token");
      console.debug(
        "[emprestimosService.criar] storedToken:",
        storedToken ? "present" : "missing"
      );
      console.debug(
        "[emprestimosService.criar] api.defaults.headers.common.Authorization:",
        (api.defaults.headers as any).common
          ?.Authorization || null
      );
    } catch (e) {
      console.error(
        "[emprestimosService.criar] erro ao ler token:",
        e
      );
    }

    const response = await api.post<LoanResponse>(
      API_ENDPOINTS.EMPRESTIMOS.CREATE_SELF,
      request
    );
    return await mapLoanResponseToEmprestimo(response.data);
  },

  /**
   * Criar empréstimo para outro usuário (ADMIN/BIBLIOTECARIO)
   * POST /loans/admin/{userId}
   */
  async criarParaUsuario(
    userId: number,
    dados: CriarEmprestimoRequest
  ): Promise<Emprestimo> {
    const request: LoanRequest = {
      userId: userId,
      isbnCodes: dados.isbnCodes,
    };

    const response = await api.post<LoanResponse>(
      API_ENDPOINTS.EMPRESTIMOS.CREATE_ADMIN(
        String(userId)
      ),
      request
    );
    return await mapLoanResponseToEmprestimo(response.data);
  },

  /**
   * Buscar empréstimo por ID
   * GET /loans/{id}
   */
  async buscarPorId(id: number): Promise<Emprestimo> {
    const response = await api.get<LoanResponse>(
      API_ENDPOINTS.EMPRESTIMOS.BY_ID(id)
    );
    return await mapLoanResponseToEmprestimo(response.data);
  },

  /**
   * Listar empréstimos do usuário autenticado
   * GET /loans/users
   */
  async listarPorUsuario(): Promise<Emprestimo[]> {
    const response = await api.get(
      API_ENDPOINTS.EMPRESTIMOS.BY_USER
    );

    // Verificar se é array ou paginado
    const loansArray = Array.isArray(response.data)
      ? response.data
      : response.data?.content || [];

    return await Promise.all(
      loansArray.map(mapLoanResponseToEmprestimo)
    );
  },

  /**
   * Devolver livros (ADMIN/BIBLIOTECARIO)
   * PATCH /loans/return
   */
  async devolver(dados: {
    isbnCodes: string[];
    userId?: number;
  }): Promise<LoanReturnResponse> {
    const payload: any = { isbnCodes: dados.isbnCodes };
    if (dados.userId !== undefined)
      payload.userId = dados.userId;
    const response = await api.patch<LoanReturnResponse>(
      API_ENDPOINTS.EMPRESTIMOS.RETURN,
      payload
    );
    return response.data;
  },
};

