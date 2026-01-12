import { useMemo, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/layouts";
import { PageBreadcrumb } from "@/components/layouts/PageBreadcrumb";
import { DataTable } from "@/components/main/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { cursosService } from "@/services";
import type { Curso } from "@/types";
import { getErrorMessage } from "@/lib/errorMessage";

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
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const fetchCursos = async () => {
    try {
      setIsLoading(true);
      const response = await cursosService.listarTodos();
      setCursos(response);
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
      await cursosService.deletar(cursoToDelete.courseCode);
      toast.success("Curso excluído com sucesso!");
      fetchCursos();
    } catch (error: any) {
      const message = getErrorMessage(
        error.response?.data?.message,
        "Erro ao excluir curso"
      );
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
    onViewTeachers: (curso) => {
      navigate(
        `/admin/professores-por-curso?courseName=${encodeURIComponent(
          curso.courseName
        )}`
      );
    },
  });

  const filteredCursos = useMemo(() => {
    if (!searchTerm.trim()) {
      return cursos;
    }
    const normalizedTerm = searchTerm
      .trim()
      .toLowerCase();
    return cursos.filter((curso) => {
      const nameMatch = curso.courseName
        .toLowerCase()
        .includes(normalizedTerm);
      const codeMatch = String(curso.courseCode).includes(
        normalizedTerm
      );
      return nameMatch || codeMatch;
    });
  }, [cursos, searchTerm]);

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
            <p className="text-gray-600 mt-1 dark:text-slate-300">
              Cadastre e gerencie os cursos oferecidos pela
              instituição
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Button
              variant="outline"
              asChild
              className="w-full sm:w-auto"
            >
              <Link to="/admin/professores-por-curso">
                Buscar professores
              </Link>
            </Button>
            <Button
              onClick={handleNewCurso}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg hover:from-blue-700 hover:to-indigo-700 sm:w-auto"
            >
              <GraduationCap className="h-5 w-5 mr-2" />
              Novo Curso
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-4 mb-4 dark:bg-slate-900 dark:text-slate-100">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="flex-1">
              <label
                htmlFor="curso-search"
                className="text-sm font-medium text-gray-700 dark:text-slate-200"
              >
                Buscar cursos
              </label>
              <Input
                id="curso-search"
                placeholder="Digite o nome ou ID do curso"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
                className="mt-2"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setSearchTerm("")}
              className="w-full md:w-auto"
            >
              Limpar filtros
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg dark:bg-slate-900 dark:text-slate-100">
          <DataTable
            columns={columns}
            data={filteredCursos}
          />
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
                  {cursoToDelete?.courseName}
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
