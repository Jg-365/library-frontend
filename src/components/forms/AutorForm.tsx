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
import type { Autor } from "@/types";
import {
  autorFormSchema,
  type AutorFormValues,
} from "@/schemas";
import {
  autoresService,
  type AutorPayload,
} from "@/services";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { getErrorMessage } from "@/lib/errorMessage";

interface AutorFormProps {
  autor?: Autor;
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

export function AutorForm({
  autor,
  onSuccess,
  onCancel,
  className,
}: AutorFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<AutorFormValues>({
    resolver: zodResolver(autorFormSchema),
    defaultValues: {
      nome: autor?.nome || "",
      email: autor?.email || "",
      nacionalidade: autor?.nacionalidade || "",
    },
  });

  const onSubmit = async (data: AutorFormValues) => {
    try {
      setIsLoading(true);

      // Mapear para o formato do backend
      const payload: AutorPayload = {
        name: data.nome,
        email: data.email,
        nationality: data.nacionalidade,
      };

      if (autor) {
        await autoresService.atualizar(
          autor.email,
          payload
        );
        toast.success("Autor atualizado com sucesso!");
      } else {
        await autoresService.criar(payload);
        toast.success("Autor cadastrado com sucesso!");
      }

      onSuccess?.();
    } catch (error: any) {
      const errorMessage = getErrorMessage(
        error.response?.data?.error ||
          error.response?.data?.message,
        "Tente novamente"
      );

      toast.error(
        autor
          ? "Erro ao atualizar autor"
          : "Erro ao cadastrar autor",
        {
          description: errorMessage,
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
        className={className || "space-y-6"}
      >
        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Digite o nome do autor"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nacionalidade"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nacionalidade *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Digite a nacionalidade"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Digite o email do autor"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3 pt-4">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {autor ? "Atualizar" : "Cadastrar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
export default AutorForm;
