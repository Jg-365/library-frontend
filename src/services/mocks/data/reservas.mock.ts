import type { Reserva } from "@/types/Reserva";
import { mockBooks } from "./books.mock";

export const mockReservas: Reserva[] = [
  {
    id: 1,
    usuarioId: 1,
    livroId: 2, // The Pragmatic Programmer
    dataReserva: "2025-12-29",
    status: "ATIVA",
    prazoRetirada: "2026-01-02", // 4 dias para retirar
    livro: mockBooks[1],
  },
  {
    id: 2,
    usuarioId: 1,
    livroId: 4, // Padrões de Projeto
    dataReserva: "2025-12-30",
    status: "ATIVA",
    prazoRetirada: "2026-01-03", // 4 dias para retirar
    livro: mockBooks[3],
  },
  {
    id: 3,
    usuarioId: 1,
    livroId: 1, // Clean Code
    dataReserva: "2025-12-25",
    status: "CONCLUIDA",
    prazoRetirada: "2025-12-29",
    livro: mockBooks[0],
  },
];

