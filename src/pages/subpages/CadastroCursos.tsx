import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layouts";
import { PageBreadcrumb } from "@/components/layouts/PageBreadcrumb";
import { DataTable } from "@/components/main/data-table";
import { Button } from "@/components/ui/button";
import {
  CustomModal,
  CustomModalContent,
  CustomModalDescription,
  CustomModalHeader,
  CustomModalTitle,
} from "@/components/ui/custom-modal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CursoForm } from "@/components/forms/CursoForm";
import { createCursoColumn } from "@/components/ui/columns/cursosColumn";
import { GraduationCap } from "lucide-react";
import { toast } from "sonner";
import api from "@/services/api";
import { API_ENDPOINTS } from "@/config/constants";
import type { Curso } from "@/types";

export function CadastroCursos() {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] =
    useState(false);
  const [selectedCurso, setSelectedCurso] =
    useState<Curso | null>(null);
  const [cursoToDelete, setCursoToDelete] =
    useState<Curso | null>(null);

  const fetchCursos = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(
        API_ENDPOINTS.CURSOS.BASE
      );
      // Mapear courseCode -> cod_curso e courseName -> nome
      const cursosMapeados = response.data.map(
        (curso: any) => ({
          cod_curso: curso.courseCode,
          nome: curso.courseName,
        })
      );
      setCursos(cursosMapeados);
    } catch (error: any) {
      toast.error("Erro ao carregar cursos");
      console.error("Erro ao buscar cursos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCursos();
  }, []);

  const handleEdit = (curso: Curso) => {
    setSelectedCurso(curso);
    setDialogOpen(true);
  };

  const handleDelete = (curso: Curso) => {
    setCursoToDelete(curso);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!cursoToDelete) return;

    try {
      await api.delete(
        `${API_ENDPOINTS.CURSOS.BASE}/${cursoToDelete.cod_curso}`
      );
      toast.success("Curso excluído com sucesso!");
      fetchCursos();
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        "Erro ao excluir curso";
      toast.error(message);
    } finally {
      setDeleteDialogOpen(false);
      setCursoToDelete(null);
    }
  };

  const handleSuccess = () => {
    setDialogOpen(false);
    setSelectedCurso(null);
    fetchCursos();
  };

  const handleNewCurso = () => {
    setSelectedCurso(null);
    setDialogOpen(true);
  };

  const columns = createCursoColumn({
    onEdit: handleEdit,
    onDelete: handleDelete,
  });

  return (
    <PageLayout perfil="ADMIN">
      <div className="w-full max-w-7xl mx-auto">
        <PageBreadcrumb
          items={[
            { label: "Início", href: "/admin" },
            { label: "Cursos" },
          ]}
          backTo="/admin"
        />
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Gerenciamento de Cursos
            </h1>
            <p className="text-gray-600 mt-1">
              Cadastre e gerencie os cursos oferecidos pela
              instituição
            </p>
          </div>
          <Button
            onClick={handleNewCurso}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
          >
            <GraduationCap className="h-5 w-5 mr-2" />
            Novo Curso
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-lg">
          <DataTable columns={columns} data={cursos} />
        </div>

        {/* Dialog de Cadastro/Edição */}
        <CustomModal
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        >
          <CustomModalContent
            className="max-w-2xl max-h-[90vh] overflow-y-auto"
            showCloseButton
            onClose={() => setDialogOpen(false)}
          >
            <CustomModalHeader>
              <CustomModalTitle>
                {selectedCurso
                  ? "Editar Curso"
                  : "Novo Curso"}
              </CustomModalTitle>
              <CustomModalDescription>
                {selectedCurso
                  ? "Atualize as informações do curso"
                  : "Preencha os dados para cadastrar um novo curso"}
              </CustomModalDescription>
            </CustomModalHeader>
            <CursoForm
              curso={selectedCurso || undefined}
              onSuccess={handleSuccess}
            />
          </CustomModalContent>
        </CustomModal>

        {/* Dialog de Confirmação de Exclusão */}
        <AlertDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Confirmar Exclusão
              </AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir o curso{" "}
                <span className="font-semibold">
                  {cursoToDelete?.nome}
                </span>
                ? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PageLayout>
  );
}
