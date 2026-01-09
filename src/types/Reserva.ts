import type { Usuario } from "./Usuario";
import type Livro from "./Livro";

export interface Reserva {
  id: number;
  usuarioId: number;
  livroIsbn?: string; // Adicionar suporte para ISBN
  livroId?: number; // Manter compatibilidade
  dataReserva: string; // YYYY-MM-DD ou ISO DateTime
  status?: "ATIVA" | "CONCLUIDA" | "CANCELADA"; // Status da reserva (opcional pois backend pode não retornar)
  prazoRetirada?: string; // YYYY-MM-DD - Prazo para retirar o livro (opcional)

  usuario?: Usuario; // opcional
  livro?: Livro; // opcional
}
