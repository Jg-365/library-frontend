import type { Usuario, Livro, Multa } from "./index.ts";

/**
 * Empréstimo (Loan) - Formato Frontend
 */
export interface Emprestimo {
  id: number; // loanCode do backend
  usuarioId: number; // userId do backend
  dataInicio: string; // loanDate (ISO Date)
  // Compatibilidade: alguns componentes/mocks usam `dataEmprestimo`
  dataEmprestimo?: string;
  dataPrevistaDevolucao: string; // expectedReturnDate (ISO Date)
  dataDevolucaoReal?: string; // returnDate (ISO Date, null se não devolvido)
  copyCodes: string[]; // IDs das cópias físicas emprestadas
  status: "ATIVO" | "DEVOLVIDO" | "ATRASADO"; // Calculado pelo frontend

  // Campos opcionais/expandidos
  livros?: Livro[]; // Para exibição (buscados separadamente)
  usuario?: Usuario; // Para exibição (buscados separadamente)
  multa?: number | Multa; // Se houver multa associada
}

/**
 * Request para criar empréstimo
 */
export interface CriarEmprestimoRequest {
  isbnCodes: string[]; // Lista de ISBNs para emprestar
  userId?: number; // Opcional, usado apenas por admin
}
