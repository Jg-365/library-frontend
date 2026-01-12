import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from "lucide-react";

// Função para gerar cor baseada no ID da categoria
const getCategoryColor = (categoryId: number): string => {
  const colors = [
    "bg-sky-100 text-sky-800 hover:bg-sky-200",
    "bg-green-100 text-green-800 hover:bg-green-200",
    "bg-purple-100 text-purple-800 hover:bg-purple-200",
    "bg-orange-100 text-orange-800 hover:bg-orange-200",
    "bg-pink-100 text-pink-800 hover:bg-pink-200",
    "bg-cyan-100 text-cyan-800 hover:bg-cyan-200",
    "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
    "bg-red-100 text-red-800 hover:bg-red-200",
    "bg-teal-100 text-teal-800 hover:bg-teal-200",
    "bg-cyan-100 text-cyan-800 hover:bg-cyan-200",
  ];
  return colors[categoryId % colors.length];
};

export interface SubcategoriaTable {
  id: number;
  cod_subcategoria: string;
  descricao: string;
  cod_categoria_principal: number;
  categoria_nome?: string;
}

export const subcategoriaColumns = (
  onEdit: (subcategoria: SubcategoriaTable) => void,
  onDelete: (subcategoria: SubcategoriaTable) => void
): ColumnDef<SubcategoriaTable>[] => [
  {
    accessorKey: "id",
    header: "ID",
    size: 80,
  },
  {
    accessorKey: "cod_subcategoria",
    header: "Código",
    size: 120,
  },
  {
    accessorKey: "descricao",
    header: "Descrição",
    size: 250,
  },
  {
    accessorKey: "categoria_nome",
    header: "Categoria Principal",
    size: 200,
    cell: ({ row }) => {
      const subcategoria = row.original;
      const categoryId =
        subcategoria.cod_categoria_principal;
      const categoryName =
        subcategoria.categoria_nome || "N/A";

      return (
        <Badge className={getCategoryColor(categoryId)}>
          {categoryName}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Ações",
    size: 120,
    cell: ({ row }) => {
      const subcategoria = row.original;
      return (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(subcategoria)}
            className="h-8 w-8 p-0"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(subcategoria)}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];



