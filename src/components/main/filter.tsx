import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Search, Filter, X, FilterX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export interface BookFilterValues {
  titulo?: string;
  autor?: string;
  editora?: string;
  ano?: string;
  isbn?: string;
  category?: string;
  subCategory?: string;
}

interface BookFiltersProps {
  onFilterChange: (filters: BookFilterValues) => void;
  onClearFilters: () => void;
}

const FILTER_DEBOUNCE_MS = 350;

const filterLabels: Record<keyof BookFilterValues, string> =
  {
    titulo: "Título",
    autor: "Autor",
    editora: "Editora",
    ano: "Ano",
    isbn: "ISBN",
    category: "Categoria",
    subCategory: "Subcategoria",
  };

export function BookFilters({
  onFilterChange,
  onClearFilters,
}: BookFiltersProps) {
  const [filters, setFilters] = useState<BookFilterValues>(
    {}
  );
  const [isOpen, setIsOpen] = useState(false);
  const skipDebounceRef = useRef(false);
  const pendingToastRef = useRef<{
    key: keyof BookFilterValues;
    value: string;
  } | null>(null);

  const handleFilterChange = (
    key: keyof BookFilterValues,
    value: string,
    options?: {
      debounce?: boolean;
      showToast?: boolean;
    }
  ) => {
    const shouldDebounce = options?.debounce ?? true;
    const showToast = options?.showToast ?? true;
    const newFilters = {
      ...filters,
      [key]: value || undefined,
    };
    setFilters(newFilters);
    if (shouldDebounce) {
      pendingToastRef.current =
        value && showToast ? { key, value } : null;
      return;
    }

    skipDebounceRef.current = true;
    onFilterChange(newFilters);

    if (value && showToast) {
      toast.success(`Filtro aplicado`, {
        description: `${filterLabels[key]}: "${value}"`,
        duration: 2000,
      });
    }
  };

  const handleClear = () => {
    setFilters({});
    skipDebounceRef.current = true;
    pendingToastRef.current = null;
    onClearFilters();
    setIsOpen(false);
    toast.info("Filtros removidos", {
      description: "Exibindo todos os resultados",
      duration: 2000,
    });
  };

  const handleRemoveFilter = (
    key: keyof BookFilterValues
  ) => {
    handleFilterChange(key, "", {
      debounce: false,
      showToast: false,
    });
    toast.info("Filtro removido", {
      description: `${filterLabels[key]} foi removido`,
      duration: 2000,
    });
  };

  useEffect(() => {
    if (skipDebounceRef.current) {
      skipDebounceRef.current = false;
      return;
    }

    const timeout = setTimeout(() => {
      onFilterChange(filters);
      if (pendingToastRef.current) {
        const { key, value } = pendingToastRef.current;
        toast.success("Filtro aplicado", {
          description: `${filterLabels[key]}: "${value}"`,
          duration: 2000,
        });
        pendingToastRef.current = null;
      }
    }, FILTER_DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [filters, onFilterChange]);

  const activeFiltersCount =
    Object.values(filters).filter(Boolean).length;

  return (
    <div className="space-y-3 mb-6 w-full">
      {/* Barra de busca e controles */}
      <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center w-full">
        {/* Busca rápida por título */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por título..."
              value={filters.titulo || ""}
              onChange={(e) =>
                handleFilterChange("titulo", e.target.value)
              }
              className="pl-9 h-10 sm:h-11"
            />
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex gap-2">
          {/* Filtros avançados */}
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="gap-2 flex-1 sm:flex-initial h-10 sm:h-11"
              >
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">
                  Filtros
                </span>
                {activeFiltersCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-1 px-1.5 bg-blue-100 text-blue-700 border-blue-200"
                  >
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm">
                    Filtros Avançados
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClear}
                    className="h-8 px-2 text-xs"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Limpar
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label
                      htmlFor="autor"
                      className="text-xs"
                    >
                      Autor
                    </Label>
                    <Input
                      id="autor"
                      placeholder="Nome do autor..."
                      value={filters.autor || ""}
                      onChange={(e) =>
                        handleFilterChange(
                          "autor",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="editora"
                      className="text-xs"
                    >
                      Editora
                    </Label>
                    <Input
                      id="editora"
                      placeholder="Nome da editora..."
                      value={filters.editora || ""}
                      onChange={(e) =>
                        handleFilterChange(
                          "editora",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="isbn"
                      className="text-xs"
                    >
                      ISBN
                    </Label>
                    <Input
                      id="isbn"
                      placeholder="978-..."
                      value={filters.isbn || ""}
                      onChange={(e) =>
                        handleFilterChange(
                          "isbn",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="ano"
                      className="text-xs"
                    >
                      Ano de Publicação
                    </Label>
                    <Select
                      value={filters.ano}
                      onValueChange={(value) =>
                        handleFilterChange("ano", value, {
                          debounce: false,
                        })
                      }
                    >
                      <SelectTrigger id="ano">
                        <SelectValue placeholder="Todos os anos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2024">
                          2024
                        </SelectItem>
                        <SelectItem value="2023">
                          2023
                        </SelectItem>
                        <SelectItem value="2022">
                          2022
                        </SelectItem>
                        <SelectItem value="2021">
                          2021
                        </SelectItem>
                        <SelectItem value="2020">
                          2020
                        </SelectItem>
                        <SelectItem value="2019">
                          2019
                        </SelectItem>
                        <SelectItem value="2018">
                          2018
                        </SelectItem>
                        <SelectItem value="2017">
                          2017
                        </SelectItem>
                        <SelectItem value="2016">
                          2016
                        </SelectItem>
                        <SelectItem value="2015">
                          2015
                        </SelectItem>
                        <SelectItem value="older">
                          Anterior a 2015
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="categoria"
                      className="text-xs"
                    >
                      Categoria
                    </Label>
                    <Select
                      value={filters.category}
                      onValueChange={(value) =>
                        handleFilterChange(
                          "category",
                          value,
                          { debounce: false }
                        )
                      }
                    >
                      <SelectTrigger id="categoria">
                        <SelectValue placeholder="Todas as categorias" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Tecnologia">
                          Tecnologia
                        </SelectItem>
                        <SelectItem value="Programação">
                          Programação
                        </SelectItem>
                        <SelectItem value="Design">
                          Design
                        </SelectItem>
                        <SelectItem value="Negócios">
                          Negócios
                        </SelectItem>
                        <SelectItem value="Ciências">
                          Ciências
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="subcategoria"
                      className="text-xs"
                    >
                      Subcategoria
                    </Label>
                    <Input
                      id="subcategoria"
                      placeholder="Nome da subcategoria..."
                      value={filters.subCategory || ""}
                      onChange={(e) =>
                        handleFilterChange(
                          "subCategory",
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>

                <Button
                  onClick={() => setIsOpen(false)}
                  className="w-full"
                  size="sm"
                >
                  Aplicar Filtros
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {/* Botão de limpar todos os filtros */}
          {activeFiltersCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
              className="gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 flex-1 sm:flex-initial h-10 sm:h-11"
            >
              <FilterX className="h-4 w-4" />
              <span className="hidden sm:inline">
                Limpar
              </span>
            </Button>
          )}
        </div>
      </div>

      {/* Badges de filtros ativos - Responsivo e organizado */}
      {activeFiltersCount > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-semibold text-blue-700 flex items-center gap-1">
              <Filter className="h-3 w-3" />
              Filtros ativos:
            </span>
            {Object.entries(filters).map(([key, value]) => {
              if (!value) return null;

              const displayValue =
                key === "ano" && value === "older"
                  ? "< 2015"
                  : value;

              return (
                <Badge
                  key={key}
                  variant="secondary"
                  className="gap-1.5 bg-white border-blue-300 text-blue-700 hover:bg-blue-100 transition-colors pl-2.5 pr-2 py-1"
                >
                  <span className="text-xs font-medium">
                    {
                      filterLabels[
                        key as keyof BookFilterValues
                      ]
                    }
                    :
                  </span>
                  <span className="text-xs">
                    {displayValue}
                  </span>
                  <X
                    className="h-3.5 w-3.5 cursor-pointer hover:text-red-600 transition-colors ml-0.5"
                    onClick={() =>
                      handleRemoveFilter(
                        key as keyof BookFilterValues
                      )
                    }
                  />
                </Badge>
              );
            })}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-7 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              Limpar todos
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
