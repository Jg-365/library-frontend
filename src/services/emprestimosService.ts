/**
 * Serviço de Empréstimos - Consumindo API real
 *
 * Este serviço centraliza todas as operações relacionadas a empréstimos (loans).
 * Integrado com a API real do backend.
 */

import api from "./api";
import { API_ENDPOINTS } from "@/config/constants";
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

  console.log("🔍 Processando empréstimo:", {
    loanCode: loan.loanCode,
    copyCodes: loan.copyCodes,
  });

  if (loan.copyCodes && loan.copyCodes.length > 0) {
    // Extrair ISBNs dos copyCodes (formato: "isbn-sequential")
    const isbns = new Set<string>();

    for (const copyCode of loan.copyCodes) {
      console.log("📦 CopyCode:", copyCode);
      // copyCode formato: "9788521207467-10"
      const parts = copyCode.split("-");
      if (parts.length === 2) {
        isbns.add(parts[0]); // ISBN é a primeira parte
        console.log("✅ ISBN extraído:", parts[0]);
      } else {
        console.warn(
          "⚠️ CopyCode formato inesperado:",
          copyCode
        );
      }
    }

    console.log(
      "📚 ISBNs únicos a buscar:",
      Array.from(isbns)
    );

    // Buscar cada livro pelo ISBN
    for (const isbn of isbns) {
      try {
        console.log(`🔎 Buscando livro ISBN: ${isbn}`);
        const response = await api.get(`/books/${isbn}`);
        console.log("✅ Livro encontrado:", response.data);
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

  console.log("📖 Livros mapeados:", livros);

  return {
    id: loan.loanCode,
    usuarioId: loan.userId,
    dataInicio: loan.loanDate,
    // Compatibilidade: alguns componentes ainda usam `dataEmprestimo`
    dataEmprestimo: loan.loanDate,
    dataPrevistaDevolucao: loan.expectedReturnDate,
    dataDevolucaoReal: loan.returnDate || undefined,
    copyCodes: loan.copyCodes,
    livros: livros,
    status: status,
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

    console.log("📚 Empréstimos recebidos:", response.data);

    // Verificar se é array ou paginado
    const loansArray = Array.isArray(response.data)
      ? response.data
      : response.data?.content || [];

    return await Promise.all(
      loansArray.map(mapLoanResponseToEmprestimo)
    );
  },

  /**
   * Listar TODOS os empréstimos (ADMIN/BIBLIOTECARIO)
   * Usa o endpoint GET /loans para listar todos os empréstimos do sistema
   */
  async listarTodos(): Promise<Emprestimo[]> {
    try {
      console.log("🔍 Buscando todos os empréstimos...");

      const response = await api.get(
        API_ENDPOINTS.EMPRESTIMOS.BASE
      );

      console.log(
        "📚 Empréstimos recebidos:",
        response.data
      );

      // Verificar se é array ou paginado
      const loansArray = Array.isArray(response.data)
        ? response.data
        : response.data?.content || [];

      const emprestimos = await Promise.all(
        loansArray.map(mapLoanResponseToEmprestimo)
      );

      console.log(
        `✅ Total de empréstimos encontrados: ${emprestimos.length}`
      );

      return emprestimos;
    } catch (error) {
      console.error(
        "❌ Erro ao listar empréstimos:",
        error
      );
      throw error;
    }
  },

  /**
   * Devolver livros (ADMIN/BIBLIOTECARIO)
   * PATCH /loans/return
   */
  async devolver(dados: {
    isbnCodes: string[];
  }): Promise<LoanReturnResponse> {
    const response = await api.patch<LoanReturnResponse>(
      API_ENDPOINTS.EMPRESTIMOS.RETURN,
      dados
    );
    return response.data;
  },
};
