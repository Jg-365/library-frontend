import type { Multa } from "@/types/Multa";

export const mockMultas: Multa[] = [
  {
    id: 1,
    usuarioId: 1,
    emprestimoId: 4,
    valor: 15.0,
    motivoMulta: "Atraso de 6 dias na devolução",
    dataCriacao: "2024-12-10",
    pago: false,
  },
  {
    id: 2,
    usuarioId: 1,
    emprestimoId: 5,
    valor: 120.0,
    motivoMulta: "Atraso de 47 dias na devolução",
    dataCriacao: "2025-01-01",
    pago: false,
  },
  {
    id: 3,
    usuarioId: 2,
    emprestimoId: 6,
    valor: 10.0,
    motivoMulta: "Atraso de 4 dias na devolução",
    dataCriacao: "2024-12-20",
    pago: true,
    dataPagamento: "2024-12-22",
  },
  {
    id: 4,
    usuarioId: 3,
    emprestimoId: 7,
    valor: 25.0,
    motivoMulta: "Atraso de 10 dias na devolução",
    dataCriacao: "2024-11-15",
    pago: true,
    dataPagamento: "2024-11-20",
  },
];

export const calcularMulta = (
  diasAtraso: number
): number => {
  // R$ 2,50 por dia de atraso
  const valorPorDia = 2.5;
  return diasAtraso * valorPorDia;
};
