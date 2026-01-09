import { useState } from "react";
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
import { api } from "@/services/api";
import type { Categoria } from "@/types";
import {
  categoriaFormSchema,
  type CategoriaFormValues,
} from "@/schemas";
import { API_ENDPOINTS } from "@/config";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface CategoriaFormProps {
  categoria?: Categoria;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CategoriaForm({
  categoria,
  onSuccess,
  onCancel,
}: CategoriaFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CategoriaFormValues>({
    resolver: zodResolver(categoriaFormSchema),
    defaultValues: {
      descricao: categoria?.descricao || "",
    },
  });

  const onSubmit = async (data: CategoriaFormValues) => {
    try {
      setIsLoading(true);

      // Mapear campos do frontend para o backend
      const payload = {
        description: data.descricao,
      };

      if (categoria) {
        // Editar categoria existente
        console.log(
          "Tentando atualizar categoria:",
          categoria.id,
          payload
        );
        await api.patch(
          API_ENDPOINTS.CATEGORIAS.BY_ID(categoria.id),
          payload
        );
        toast.success("Categoria atualizada com sucesso!");
      } else {
        // Criar nova categoria
        console.log("Criando nova categoria:", payload);
        await api.post(
          API_ENDPOINTS.CATEGORIAS.BASE,
          payload
        );
        toast.success("Categoria cadastrada com sucesso!");
      }

      form.reset();
      onSuccess?.();
    } catch (error: any) {
      toast.error(
        categoria
          ? "Erro ao atualizar categoria"
          : "Erro ao cadastrar categoria",
        {
          description:
            error.response?.data?.message ||
            error.response?.data?.error ||
            "Tente novamente",
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
          name="descricao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição *</FormLabel>
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
            {categoria ? "Atualizar" : "Cadastrar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
