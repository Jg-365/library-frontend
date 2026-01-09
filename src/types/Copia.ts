/**
 * Tipo para Cópia (exemplar físico de um livro)
 */
export interface Copia {
  sequential: number;
  isbn: string;
  status: string;
}

/**
 * Status possíveis de uma cópia
 */
export const StatusCopia = {
  DISPONIVEL: "disponivel",
  EMPRESTADO: "emprestado",
  RESERVADO: "reservado",
  MANUTENCAO: "manutencao",
  PERDIDO: "perdido",
} as const;

export type StatusCopiaType =
  (typeof StatusCopia)[keyof typeof StatusCopia];

/**
 * Labels para exibição dos status
 */
export const STATUS_LABELS: Record<string, string> = {
  disponivel: "Disponível",
  emprestado: "Emprestado",
  reservado: "Reservado",
  manutencao: "Em Manutenção",
  perdido: "Perdido",
};

/**
 * Cores para os badges de status
 */
export const STATUS_COLORS: Record<
  string,
  {
    bg: string;
    text: string;
    border: string;
  }
> = {
  disponivel: {
    bg: "bg-green-100",
    text: "text-green-800",
    border: "border-green-300",
  },
  emprestado: {
    bg: "bg-yellow-100",
    text: "text-yellow-800",
    border: "border-yellow-300",
  },
  reservado: {
    bg: "bg-blue-100",
    text: "text-blue-800",
    border: "border-blue-300",
  },
  manutencao: {
    bg: "bg-orange-100",
    text: "text-orange-800",
    border: "border-orange-300",
  },
  perdido: {
    bg: "bg-red-100",
    text: "text-red-800",
    border: "border-red-300",
  },
};
