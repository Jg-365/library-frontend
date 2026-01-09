import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  cursoFormSchema,
  type CursoFormData,
} from "@/schemas/CursoSchema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { cursosService } from "@/services";
import type { Curso } from "@/types";

interface CursoFormProps {
  curso?: Curso;
  onSuccess?: () => void;
}

export function CursoForm({
  curso,
  onSuccess,
}: CursoFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!curso;

  const form = useForm<CursoFormData>({
    resolver: zodResolver(cursoFormSchema),
    defaultValues: {
      courseName: curso?.courseName || "",
    },
  });

  const onSubmit = async (data: CursoFormData) => {
    setIsSubmitting(true);
    try {
      if (isEditing) {
        await api.patch(API_ENDPOINTS.CURSOS.BASE, {
          courseCode: curso.courseCode,
          courseName: data.courseName,
        });
        toast.success("Curso atualizado com sucesso!");
      } else {
        await cursosService.criar(data);
        toast.success("Curso cadastrado com sucesso!");
        form.reset();
      }
      onSuccess?.();
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        "Erro ao salvar curso";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
      >
        <FormField
          control={form.control}
          name="courseName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Curso</FormLabel>
              <FormControl>
                <Input
                  placeholder="Digite o nome do curso"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            {isSubmitting
              ? "Salvando..."
              : isEditing
              ? "Atualizar Curso"
              : "Cadastrar Curso"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
