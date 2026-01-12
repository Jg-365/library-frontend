import type { Emprestimo } from "@/types/Emprestimo";
import { mockBooks } from "./books.mock";

export const mockEmprestimos: Emprestimo[] = [
  {
    id: 1,
    usuarioId: 1,
    livros: [mockBooks[0]], // Clean Code
    livro: mockBooks[0],
    dataInicio: "2025-01-15",
    dataEmprestimo: "2025-01-15",
    dataPrevistaDevolucao: "2025-01-29",
    dataDevolucaoReal: undefined,
    multa: 0,
    status: "ATIVO",
  },
  {
    id: 2,
    usuarioId: 1,
    livros: [mockBooks[1]], // The Pragmatic Programmer
    livro: mockBooks[1],
    dataInicio: "2025-01-10",
    dataEmprestimo: "2025-01-10",
    dataPrevistaDevolucao: "2025-01-24",
    dataDevolucaoReal: undefined,
    multa: 0,
    status: "ATIVO",
  },
  {
    id: 3,
    usuarioId: 1,
    livros: [mockBooks[2]], // JavaScript: The Good Parts
    livro: mockBooks[2],
    dataInicio: "2024-12-15",
    dataEmprestimo: "2024-12-15",
    dataPrevistaDevolucao: "2024-12-29",
    dataDevolucaoReal: "2024-12-28",
    multa: 0,
    status: "DEVOLVIDO",
  },
  {
    id: 4,
    usuarioId: 1,
    livros: [mockBooks[3]], // Design Patterns
    livro: mockBooks[3],
    dataInicio: "2024-11-20",
    dataEmprestimo: "2024-11-20",
    dataPrevistaDevolucao: "2024-12-04",
    dataDevolucaoReal: "2024-12-10",
    multa: 15.0,
    status: "DEVOLVIDO",
  },
  {
    id: 5,
    usuarioId: 1,
    livros: [mockBooks[0]], // Clean Code novamente
    livro: mockBooks[0],
    dataInicio: "2024-12-01",
    dataEmprestimo: "2024-12-01",
    dataPrevistaDevolucao: "2024-12-15",
    dataDevolucaoReal: undefined,
    multa: 120.0,
    status: "ATRASADO",
  },
  // Empréstimo com múltiplos livros
  {
    id: 6,
    usuarioId: 2,
    livros: [mockBooks[0], mockBooks[1], mockBooks[2]], // 3 livros de uma vez
    livro: mockBooks[0], // Para compatibilidade
    dataInicio: "2025-01-05",
    dataEmprestimo: "2025-01-05",
    dataPrevistaDevolucao: "2025-01-19",
    dataDevolucaoReal: undefined,
    multa: 0,
    status: "ATIVO",
  },
  {
    id: 7,
    usuarioId: 3,
    livros: [mockBooks[1], mockBooks[3]], // 2 livros
    livro: mockBooks[1],
    dataInicio: "2024-11-01",
    dataEmprestimo: "2024-11-01",
    dataPrevistaDevolucao: "2024-11-15",
    dataDevolucaoReal: "2024-11-25",
    multa: 25.0,
    status: "DEVOLVIDO",
  },
];

let nextId = mockEmprestimos.length + 1;

export const adicionarEmprestimo = (
  emprestimo: Omit<Emprestimo, "id">
): Emprestimo => {
  const novoEmprestimo: Emprestimo = {
    ...emprestimo,
    id: nextId++,
  };
  mockEmprestimos.push(novoEmprestimo);
  return novoEmprestimo;
};

