import type { Usuario } from "./Usuario";
import type { Emprestimo } from "./Emprestimo";

export interface Multa {
  id: number;
  usuarioId: number;
  emprestimoId: number;
  valor: number;
  motivoMulta: string; // Ex: "Atraso de 6 dias"
  dataCriacao: string; // YYYY-MM-DD
  pago: boolean;
  dataPagamento?: string; // YYYY-MM-DD

  // Opcionais para expansão
  usuario?: Usuario;
  emprestimo?: Emprestimo;
}

export interface ResumoMultasUsuario {
  usuarioId: number;
  totalMultas: number;
  multasPagas: number;
  multasPendentes: number;
  valorTotal: number;
  valorPago: number;
  valorPendente: number;
  multas: Multa[];
}
