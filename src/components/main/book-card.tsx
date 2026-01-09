import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BookCover } from "@/components/ui/BookCover";
import type { Livro } from "@/types";
import { Users, ChevronDown } from "lucide-react";

interface BookCardProps {
  livro: Livro;
  onDetailsClick: (livro: Livro) => void;
  onReserveClick?: (livro: Livro) => void;
  onReserveForOtherClick?: (livro: Livro) => void;
  onBorrowClick?: (livro: Livro) => void;
  onBorrowForOtherClick?: (livro: Livro) => void;
  showReserveButton?: boolean;
  showBorrowButton?: boolean;
  isAdminOrBibliotecario?: boolean;
}

export function BookCard({
  livro,
  onDetailsClick,
  onReserveClick,
  onReserveForOtherClick,
  onBorrowClick,
  onBorrowForOtherClick,
  showReserveButton = false,
  showBorrowButton = false,
  isAdminOrBibliotecario = false,
}: BookCardProps) {
  const disponivel = (livro?.quantidadeExemplares ?? 0) > 0;

  return (
    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col">
      {/* Capa do Livro - Google Books API */}
      <div className="relative h-64 overflow-hidden">
        <BookCover
          isbn={livro?.isbn}
          title={
            livro?.titulo ??
            (livro as any)?.title ??
            "Título não informado"
          }
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          fallbackClassName="w-full h-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center"
        />

        {/* Badge de Disponibilidade */}
        <div className="absolute top-3 right-3">
          <Badge
            variant={disponivel ? "default" : "secondary"}
            className={
              disponivel
                ? "bg-green-500 hover:bg-green-600"
                : "bg-red-500 hover:bg-red-600"
            }
          >
            {disponivel ? "Disponível" : "Indisponível"}
          </Badge>
        </div>

        {/* Quantidade */}
        {disponivel && (
          <div className="absolute bottom-3 left-3">
            <Badge
              variant="secondary"
              className="bg-white/90 text-gray-800"
            >
              {livro.quantidadeExemplares}{" "}
              {livro.quantidadeExemplares === 1
                ? "exemplar"
                : "exemplares"}
            </Badge>
          </div>
        )}
      </div>

      {/* Informações do Livro */}
      <CardContent className="pt-4 flex-1">
        <div className="space-y-3">
          {/* Título */}
          <div>
            <h3 className="font-semibold text-base line-clamp-2 mb-2">
              {livro?.titulo ??
                (livro as any)?.title ??
                "Título não informado"}
            </h3>
          </div>

          {/* Autores */}
          <div className="flex items-start gap-2">
            <Users className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">
                {livro.autores?.length === 1
                  ? "Autor"
                  : "Autores"}
              </p>
              <p className="text-sm font-medium line-clamp-2">
                {((livro?.autores || []) as any[])
                  .map((a) => a?.nome || "")
                  .filter(Boolean)
                  .join(", ") || "Autor desconhecido"}
              </p>
            </div>
          </div>

          {/* Editora e Ano */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="text-muted-foreground">
                Editora
              </p>
              <p className="font-medium truncate">
                {livro?.editora || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Ano</p>
              <p className="font-medium">
                {livro?.ano ?? "N/A"}
              </p>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Ações */}
      <CardFooter className="pt-0 pb-4 px-4 gap-2 flex-col">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => onDetailsClick(livro)}
        >
          Ver Detalhes
        </Button>
        {showBorrowButton &&
          onBorrowClick &&
          (isAdminOrBibliotecario &&
          onBorrowForOtherClick ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Emprestar{" "}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuItem
                  onClick={() => onBorrowClick(livro)}
                >
                  Para mim
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    onBorrowForOtherClick(livro)
                  }
                >
                  Para outro usuário
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={() => onBorrowClick(livro)}
            >
              Emprestar
            </Button>
          ))}
        {showReserveButton &&
          onReserveClick &&
          (isAdminOrBibliotecario &&
          onReserveForOtherClick ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="w-full bg-orange-600 hover:bg-orange-700">
                  Reservar{" "}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuItem
                  onClick={() => onReserveClick(livro)}
                >
                  Para mim
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    onReserveForOtherClick(livro)
                  }
                >
                  Para outro usuário
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              className="w-full bg-orange-600 hover:bg-orange-700"
              onClick={() => onReserveClick(livro)}
            >
              Reservar
            </Button>
          ))}
      </CardFooter>
    </Card>
  );
}
