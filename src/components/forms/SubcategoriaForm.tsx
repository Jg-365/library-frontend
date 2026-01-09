import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Categoria } from "@/types";
import {
  subcategoriaFormSchema,
  type SubcategoriaFormValues,
} from "@/schemas/SubcategoriaSchema";
import {
  categoriasService,
  subcategoriasService,
} from "@/services";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface SubcategoriaFormProps {
  subcategoria?: {
    id: number;
    description: string;
    categoryCode: number;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function SubcategoriaForm({
  subcategoria,
  onSuccess,
  onCancel,
}: SubcategoriaFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>(
    []
  );

  const form = useForm<SubcategoriaFormValues>({
    resolver: zodResolver(subcategoriaFormSchema),
    defaultValues: {
      description: subcategoria?.description || "",
      categoryCode: subcategoria?.categoryCode || 0,
    },
  });

  useEffect(() => {
    carregarCategorias();
  }, []);

  const carregarCategorias = async () => {
    try {
      const response = await api.get<Categoria[]>(
        `${API_ENDPOINTS.CATEGORIAS.BASE}?description=`
      );

      setCategorias(response.data);
    } catch (error) {
      toast.error("Erro ao carregar categorias");
    }
  };

  const onSubmit = async (data: SubcategoriaFormValues) => {
    try {
      setIsLoading(true);

      // Payload conforme esperado pelo backend
      const payload = {
        description: data.description,
        categoryCode: data.categoryCode,
      };

      if (subcategoria) {
        // Editar
        await subcategoriasService.atualizar(
          subcategoria.id,
          payload
        );
        toast.success(
          "Subcategoria atualizada com sucesso!"
        );
      } else {
        // Criar - código da subcategoria é auto-gerado pelo backend
        await subcategoriasService.criar(payload);
        toast.success("Subcategoria criada com sucesso!");
      }

      onSuccess?.();
    } catch (error: any) {
      toast.error(
        subcategoria
          ? "Erro ao atualizar subcategoria"
          : "Erro ao criar subcategoria",
        {
          description:
            error.response?.data?.message ||
            error.message ||
            "Tente novamente mais tarde.",
        }
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
      >
        {/* Descrição */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da Subcategoria *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex: Ficção Científica"
                  {...field}
                  maxLength={100}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Categoria Principal */}
        <FormField
          control={form.control}
          name="categoryCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoria Principal *</FormLabel>
              <Select
                onValueChange={(value) =>
                  field.onChange(parseInt(value))
                }
                value={
                  field.value > 0
                    ? field.value.toString()
                    : undefined
                }
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categorias.map((categoria) => (
                    <SelectItem
                      key={categoria.categoryCode}
                      value={categoria.categoryCode.toString()}
                    >
                      {categoria.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Botões de Ação */}
        <div className="flex justify-end gap-4 pt-4">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {subcategoria ? "Atualizar" : "Criar"}{" "}
            Subcategoria
          </Button>
        </div>
      </form>
    </Form>
  );
}
