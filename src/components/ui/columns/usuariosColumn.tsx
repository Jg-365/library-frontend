import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import type { Usuario } from "@/types";

interface UsuarioColumnData extends Usuario {
  ativo?: boolean;
}

interface CreateUsuarioColumnProps {
  onEdit: (usuario: UsuarioColumnData) => void;
  onDelete: (usuario: UsuarioColumnData) => void;
}

const perfilLabels: Record<string, string> = {
  ADMINISTRADOR: "Administrador",
  BIBLIOTECARIO: "Bibliotecário",
  PROFESSOR: "Professor",
  ALUNO: "Aluno",
};

const perfilColors: Record<string, string> = {
  ADMINISTRADOR:
    "bg-red-100 text-red-800 border-red-300 dark:bg-red-500/20 dark:text-red-200 dark:border-red-500/30",
  BIBLIOTECARIO:
    "bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-500/20 dark:text-cyan-200 dark:border-cyan-500/30",
  PROFESSOR:
    "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-500/20 dark:text-purple-200 dark:border-purple-500/30",
  ALUNO:
    "bg-green-100 text-green-800 border-green-300 dark:bg-green-500/20 dark:text-green-200 dark:border-green-500/30",
};

export function createUsuarioColumn({
  onEdit,
  onDelete,
}: CreateUsuarioColumnProps): ColumnDef<UsuarioColumnData>[] {
  return [
    {
      accessorKey: "enrollment",
      header: "Matrícula",
      cell: ({ row }) => (
        <div className="font-medium">
          #{row.getValue("enrollment") || row.original.id}
        </div>
      ),
    },
    {
      accessorKey: "name",
      header: "Nome",
      cell: ({ row }) => (
        <div className="font-medium">
          {row.getValue("name") || row.original.nome}
        </div>
      ),
    },
    {
      accessorKey: "username",
      header: "Usuário",
      cell: ({ row }) => (
        <div className="text-sm text-gray-600 dark:text-slate-300">
          {row.getValue("username") || row.original.email}
        </div>
      ),
    },
    {
      accessorKey: "role",
      header: "Perfil",
      cell: ({ row }) => {
        const perfil = (row.getValue("role") ||
          row.original.perfil) as string;
        return (
          <Badge
            variant="outline"
            className={`${
              perfilColors[perfil] ||
              "bg-gray-100 text-gray-800 border-gray-300 dark:bg-slate-800/60 dark:text-slate-200 dark:border-slate-700"
            }`}
          >
            {perfilLabels[perfil] || perfil}
          </Badge>
        );
      },
    },
    {
      accessorKey: "ativo",
      header: "Status",
      cell: ({ row }) => {
        const ativo = row.original.ativo ?? true;
        return (
          <Badge
            variant="outline"
            className={
              ativo
                ? "bg-green-100 text-green-800 border-green-300 dark:bg-green-500/20 dark:text-green-200 dark:border-green-500/30"
                : "bg-gray-100 text-gray-800 border-gray-300 dark:bg-slate-800/60 dark:text-slate-200 dark:border-slate-700"
            }
          >
            {ativo ? "Ativo" : "Inativo"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Ações",
      cell: ({ row }) => {
        const usuario = row.original;

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
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onEdit(usuario)}
                className="cursor-pointer"
              >
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(usuario)}
                className="cursor-pointer text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}



