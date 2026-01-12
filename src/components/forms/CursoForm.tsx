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
import { getErrorMessage } from "@/lib/errorMessage";

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
        await cursosService.atualizar({
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
      const message = getErrorMessage(
        error.response?.data?.message,
        "Erro ao salvar curso"
      );
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="cyber-form-card"
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
            className="bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-500 hover:from-sky-600 hover:via-cyan-600 hover:to-emerald-600"
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



