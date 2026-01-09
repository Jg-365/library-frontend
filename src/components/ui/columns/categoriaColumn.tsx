"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { Categoria } from "@/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";

interface CategoriaColumnOptions {
  onEdit?: (categoria: Categoria) => void;
  onDelete?: (categoria: Categoria) => void;
}

export function createCategoriaColumn(
  options?: CategoriaColumnOptions
): ColumnDef<Categoria>[] {
  return [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => (
        <div className="font-medium">
          {row.getValue("id")}
        </div>
      ),
    },
    {
      accessorKey: "descricao",
      header: "Descrição",
      cell: ({ row }) => (
        <div>{row.getValue("descricao")}</div>
      ),
    },
    {
      id: "actions",
      header: "Ações",
      cell: ({ row }) => {
        const categoria = row.original;

        return (
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
              {options?.onEdit && (
                <DropdownMenuItem
                  onClick={() =>
                    options.onEdit?.(categoria)
                  }
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
              )}
              {options?.onDelete && (
                <DropdownMenuItem
                  onClick={() =>
                    options.onDelete?.(categoria)
                  }
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}

export const categoriaColumn: ColumnDef<Categoria>[] =
  createCategoriaColumn();
