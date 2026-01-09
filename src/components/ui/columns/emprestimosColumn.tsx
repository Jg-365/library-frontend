"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { Emprestimo } from "@/types";
import { Badge } from "@/components/ui/badge";
import {
  format,
  differenceInDays,
  parseISO,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  CalendarClock,
  CalendarCheck,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

const getStatusEmprestimo = (emprestimo: Emprestimo) => {
  // Verificação de segurança
  if (!emprestimo.dataPrevistaDevolucao) {
    return {
      status: "Sem Previsão",
      variant: "secondary" as const,
    };
  }

  const hoje = new Date();
  const dataPrevista = parseISO(
    emprestimo.dataPrevistaDevolucao
  );

  if (emprestimo.dataDevolucaoReal) {
    const dataDevolucao = parseISO(
      emprestimo.dataDevolucaoReal
    );
    if (dataDevolucao > dataPrevista) {
      return {
        status: "Devolvido com Atraso",
        variant: "destructive" as const,
      };
    }
    return {
      status: "Devolvido",
      variant: "secondary" as const,
    };
  }

  if (hoje > dataPrevista) {
    const diasAtraso = differenceInDays(hoje, dataPrevista);
    return {
      status: `Atrasado (${diasAtraso} ${
        diasAtraso === 1 ? "dia" : "dias"
      })`,
      variant: "destructive" as const,
    };
  }

  const diasRestantes = differenceInDays(
    dataPrevista,
    hoje
  );
  if (diasRestantes <= 3) {
    return {
      status: `Vence em ${diasRestantes} ${
        diasRestantes === 1 ? "dia" : "dias"
      }`,
      variant: "outline" as const,
    };
  }

  return { status: "Ativo", variant: "default" as const };
};

export const emprestimosColumn: ColumnDef<Emprestimo>[] = [
  {
    accessorKey: "id",
    header: () => <div className="text-center">ID</div>,
    cell: ({ row }) => (
      <div className="font-mono text-sm text-center">
        #{row.getValue("id")}
      </div>
    ),
  },
  {
    accessorKey: "livros",
    header: () => <div className="text-left">Livros</div>,
    cell: ({ row }) => {
      const livros = row.getValue("livros") as Array<{
        titulo: string;
        isbn: string;
      }>;

      // Verificação de segurança
      if (!livros || !Array.isArray(livros)) {
        return (
          <div className="text-left text-muted-foreground">
            Nenhum livro
          </div>
        );
      }

      return (
        <div className="text-left">
          <div className="font-medium">
            {(livros || [])
              .map(
                (livro) =>
                  livro?.titulo ??
                  (livro as any)?.title ??
                  "Título não informado"
              )
              .join(", ")}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {livros.length}{" "}
            {livros.length === 1 ? "livro" : "livros"}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "dataInicio",
    header: () => (
      <div className="text-center flex items-center justify-center gap-2">
        <CalendarClock className="h-4 w-4" />
        Data de Empréstimo
      </div>
    ),
    cell: ({ row }) => {
      const dataValue = row.getValue("dataInicio");
      if (!dataValue) {
        return (
          <div className="text-center text-muted-foreground">
            -
          </div>
        );
      }
      const data = parseISO(dataValue as string);
      return (
        <div className="text-center">
          <div className="font-medium">
            {format(data, "dd/MM/yyyy", { locale: ptBR })}
          </div>
          <div className="text-xs text-muted-foreground">
            {format(data, "EEEE", { locale: ptBR })}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "dataPrevistaDevolucao",
    header: () => (
      <div className="text-center flex items-center justify-center gap-2">
        <CalendarCheck className="h-4 w-4" />
        Previsão Devolução
      </div>
    ),
    cell: ({ row }) => {
      const dataValue = row.getValue(
        "dataPrevistaDevolucao"
      );
      if (!dataValue) {
        return (
          <div className="text-center text-muted-foreground">
            -
          </div>
        );
      }
      const data = parseISO(dataValue as string);
      const hoje = new Date();
      const diasRestantes = differenceInDays(data, hoje);

      return (
        <div className="text-center">
          <div className="font-medium">
            {format(data, "dd/MM/yyyy", { locale: ptBR })}
          </div>
          <div
            className={`text-xs ${
              diasRestantes < 0
                ? "text-red-600"
                : diasRestantes <= 3
                ? "text-yellow-600"
                : "text-muted-foreground"
            }`}
          >
            {diasRestantes < 0
              ? `${Math.abs(diasRestantes)} ${
                  Math.abs(diasRestantes) === 1
                    ? "dia"
                    : "dias"
                } de atraso`
              : diasRestantes === 0
              ? "Vence hoje"
              : `${diasRestantes} ${
                  diasRestantes === 1 ? "dia" : "dias"
                } restantes`}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "dataDevolucaoReal",
    header: () => (
      <div className="text-center flex items-center justify-center gap-2">
        <CheckCircle2 className="h-4 w-4" />
        Data Devolução
      </div>
    ),
    cell: ({ row }) => {
      const dataDevolucao = row.getValue(
        "dataDevolucaoReal"
      ) as string | undefined;

      if (!dataDevolucao) {
        return (
          <div className="text-center text-muted-foreground">
            -
          </div>
        );
      }

      const data = parseISO(dataDevolucao);
      return (
        <div className="text-center">
          <div className="font-medium">
            {format(data, "dd/MM/yyyy", { locale: ptBR })}
          </div>
          <div className="text-xs text-muted-foreground">
            {format(data, "EEEE", { locale: ptBR })}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "multa",
    header: () => (
      <div className="text-center flex items-center justify-center gap-2">
        <AlertCircle className="h-4 w-4" />
        Multa
      </div>
    ),
    cell: ({ row }) => {
      const multa = row.getValue("multa") as
        | number
        | undefined;

      if (!multa || multa === 0) {
        return (
          <div className="text-center text-muted-foreground">
            R$ 0,00
          </div>
        );
      }

      return (
        <div className="text-center">
          <span className="font-semibold text-red-600">
            R$ {multa.toFixed(2).replace(".", ",")}
          </span>
        </div>
      );
    },
  },
  {
    id: "status",
    header: () => <div className="text-center">Status</div>,
    cell: ({ row }) => {
      const emprestimo = row.original;
      const { status, variant } =
        getStatusEmprestimo(emprestimo);

      return (
        <div className="text-center">
          <Badge variant={variant}>{status}</Badge>
        </div>
      );
    },
  },
];
