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
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Users,
} from "lucide-react";
import type { Curso } from "@/types";

interface CreateCursoColumnProps {
  onEdit: (curso: Curso) => void;
  onDelete: (curso: Curso) => void;
  onViewTeachers?: (curso: Curso) => void;
  onViewStudents?: (curso: Curso) => void;
}

export function createCursoColumn({
  onEdit,
  onDelete,
  onViewTeachers,
  onViewStudents,
}: CreateCursoColumnProps): ColumnDef<Curso>[] {
  return [
    {
      accessorKey: "courseCode",
      header: "ID",
      cell: ({ row }) => (
        <div className="font-medium">
          #{row.getValue("courseCode")}
        </div>
      ),
    },
    {
      accessorKey: "courseName",
      header: "Nome",
      cell: ({ row }) => (
        <div className="font-medium">
          {row.getValue("courseName")}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Ações",
      cell: ({ row }) => {
        const curso = row.original;

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
              {onViewTeachers && (
                <DropdownMenuItem
                  onClick={() => onViewTeachers(curso)}
                  className="cursor-pointer"
                >
                  <Users className="mr-2 h-4 w-4" />
                  Ver professores
                </DropdownMenuItem>
              )}
              {onViewStudents && (
                <DropdownMenuItem
                  onClick={() => onViewStudents(curso)}
                  className="cursor-pointer"
                >
                  <Users className="mr-2 h-4 w-4" />
                  Ver alunos
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => onEdit(curso)}
                className="cursor-pointer"
              >
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(curso)}
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
