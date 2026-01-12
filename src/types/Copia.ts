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
    bg: "bg-green-100 dark:bg-green-500/20",
    text: "text-green-800 dark:text-green-200",
    border: "border-green-300 dark:border-green-500/30",
  },
  emprestado: {
    bg: "bg-yellow-100 dark:bg-yellow-500/20",
    text: "text-yellow-800 dark:text-yellow-200",
    border: "border-yellow-300 dark:border-yellow-500/30",
  },
  reservado: {
    bg: "bg-sky-100 dark:bg-sky-500/20",
    text: "text-sky-800 dark:text-cyan-200",
    border: "border-sky-300 dark:border-cyan-500/30",
  },
  manutencao: {
    bg: "bg-orange-100 dark:bg-orange-500/20",
    text: "text-orange-800 dark:text-orange-200",
    border: "border-orange-300 dark:border-orange-500/30",
  },
  perdido: {
    bg: "bg-red-100 dark:bg-red-500/20",
    text: "text-red-800 dark:text-red-200",
    border: "border-red-300 dark:border-red-500/30",
  },
};

