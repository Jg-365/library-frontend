"use client";
import { BookDetails } from "@/components/main/book-details";
import type { ColumnDef } from "@tanstack/react-table";
import { BooksSchema } from "@/schemas";
import { z } from "zod";
import { MoreHorizontal } from "lucide-react";
import {
  MdContentCopy,
  MdVisibility,
  MdEdit,
  MdDelete,
} from "react-icons/md";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../dialog";

interface BooksColumnProps {
  onViewDetails?: (
    livro: z.infer<typeof BooksSchema>
  ) => void;
  onEdit?: (livro: z.infer<typeof BooksSchema>) => void;
  onDelete?: (livro: z.infer<typeof BooksSchema>) => void;
}

export const createBooksColumn = ({
  onViewDetails,
  onEdit,
  onDelete,
}: BooksColumnProps = {}): ColumnDef<
  z.infer<typeof BooksSchema>
>[] => [
  {
    accessorKey: "isbn",
    header: () => <div className="text-center">ISBN</div>,
    cell: ({ row }) => (
      <div className="font-mono text-sm text-center">
        {row.getValue("isbn")}
      </div>
    ),
  },
  {
    accessorKey: "titulo",
    header: () => <div className="text-center">Título</div>,
    cell: ({ row }) => (
      <div className="font-medium text-center">
        {row.getValue("titulo")}
      </div>
    ),
  },
  {
    accessorKey: "autores",
    header: () => (
      <div className="text-center">Autores</div>
    ),
    cell: ({ row }) => {
      const autores =
        (row.getValue("autores") as Array<{
          nome: string;
        }>) || [];
      return (
        <div className="text-sm text-gray-600 dark:text-slate-300 text-center">
          {Array.isArray(autores) && autores.length > 0
            ? autores.map((autor) => autor.nome).join(", ")
            : "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "editora",
    header: () => (
      <div className="text-center">Editora</div>
    ),
    cell: ({ row }) => (
      <div className="text-sm text-center">
        {row.getValue("editora")}
      </div>
    ),
  },
  {
    accessorKey: "ano",
    header: () => <div className="text-center">Ano</div>,
    cell: ({ row }) => (
      <div className="text-center">
        {row.getValue("ano")}
      </div>
    ),
  },
  {
    accessorKey: "quantidadeExemplares",
    header: () => (
      <div className="text-center">Exemplares</div>
    ),
    cell: ({ row }) => {
      const quantidade = row.getValue(
        "quantidadeExemplares"
      ) as number;
      return (
        <div className="text-center">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              quantidade > 5
                ? "bg-green-100 text-green-800"
                : quantidade > 2
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {quantidade}
          </span>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Ações</div>,
    cell: ({ row }) => {
      const livro = row.original;
      const [openDialog, setOpenDialog] = useState(false);

      return (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0"
              >
                <span className="sr-only">Abrir menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ações</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() =>
                  navigator.clipboard.writeText(
                    String(livro.isbn)
                  )
                }
              >
                <MdContentCopy className="flex items-center mr-2 h-4 w-4" />
                Copiar ISBN
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onViewDetails?.(livro)}
              >
                <MdVisibility className="flex items-center mr-2 h-4 w-4" />
                Ver detalhes
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onEdit?.(livro)}
              >
                <MdEdit className="flex items-center mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => onDelete?.(livro)}
              >
                <MdDelete className="flex items-center mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];

// Mantém exportação default para compatibilidade
export const booksColumn = createBooksColumn();



