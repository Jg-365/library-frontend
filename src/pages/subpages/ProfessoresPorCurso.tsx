import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { PageLayout } from "@/components/layouts";
import { PageBreadcrumb } from "@/components/layouts/PageBreadcrumb";
import { DataTable } from "@/components/main/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cursosService, usuariosService } from "@/services";
import type { Curso, Usuario } from "@/types";
import { getErrorMessage } from "@/lib/errorMessage";

const professorColumns: ColumnDef<Usuario>[] = [
  {
    accessorKey: "enrollment",
    header: "Matrícula",
    cell: ({ row }) => (
      <div className="font-medium">
        #{row.original.enrollment ?? row.original.id}
      </div>
    ),
  },
  {
    accessorKey: "name",
    header: "Nome",
    cell: ({ row }) => (
      <div className="font-medium">
        {row.original.name ?? row.original.nome}
      </div>
    ),
  },
  {
    accessorKey: "username",
    header: "Email",
    cell: ({ row }) => (
      <div className="text-sm text-gray-600">
        {row.original.username ?? row.original.email}
      </div>
    ),
  },
  {
    accessorKey: "workRegime",
    header: "Regime",
    cell: ({ row }) => (
      <div className="text-sm text-gray-600">
        {row.original.workRegime ?? "--"}
      </div>
    ),
  },
];

export function ProfessoresPorCurso() {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [selectedCourseName, setSelectedCourseName] =
    useState("");
  const [professores, setProfessores] = useState<Usuario[]>(
    []
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingCursos, setLoadingCursos] =
    useState(true);
  const [loadingProfessores, setLoadingProfessores] =
    useState(false);
  const [searchParams, setSearchParams] =
    useSearchParams();

  const courseParam = searchParams.get("courseName") ?? "";

  useEffect(() => {
    const fetchCursos = async () => {
      try {
        setLoadingCursos(true);
        const response = await cursosService.listarTodos();
        setCursos(response);
      } catch (error: any) {
        const message = getErrorMessage(
          error.response?.data?.message,
          "Erro ao carregar cursos"
        );
        toast.error(message);
      } finally {
        setLoadingCursos(false);
      }
    };

    fetchCursos();
  }, []);

  useEffect(() => {
    if (courseParam && courseParam !== selectedCourseName) {
      setSelectedCourseName(courseParam);
    }
  }, [courseParam, selectedCourseName]);

  useEffect(() => {
    const fetchProfessores = async () => {
      if (!selectedCourseName) {
        setProfessores([]);
        return;
      }

      try {
        setLoadingProfessores(true);
        const response =
          await usuariosService.listarProfessoresPorCurso(
            selectedCourseName
          );
        setProfessores(response.content ?? []);
      } catch (error: any) {
        const message = getErrorMessage(
          error.response?.data?.message,
          "Erro ao buscar professores"
        );
        toast.error(message);
        setProfessores([]);
      } finally {
        setLoadingProfessores(false);
      }
    };

    fetchProfessores();
  }, [selectedCourseName]);

  const filteredProfessores = useMemo(() => {
    if (!searchTerm.trim()) {
      return professores;
    }

    const normalizedTerm = searchTerm
      .trim()
      .toLowerCase();
    return professores.filter((professor) => {
      const name = professor.name ?? professor.nome ?? "";
      const email =
        professor.username ?? professor.email ?? "";
      const enrollment =
        professor.enrollment ?? professor.id ?? "";
      return (
        name.toLowerCase().includes(normalizedTerm) ||
        email.toLowerCase().includes(normalizedTerm) ||
        String(enrollment).includes(normalizedTerm)
      );
    });
  }, [professores, searchTerm]);

  const handleCourseChange = (value: string) => {
    setSelectedCourseName(value);
    if (value) {
      setSearchParams({ courseName: value });
    } else {
      setSearchParams({});
    }
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    handleCourseChange("");
  };

  return (
    <PageLayout perfil="ADMIN">
      <div className="w-full max-w-7xl mx-auto">
        <PageBreadcrumb
          items={[
            { label: "Início", href: "/admin" },
            { label: "Cursos", href: "/admin/cursos" },
            { label: "Professores por curso" },
          ]}
          backTo="/admin/cursos"
        />

        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Professores por Curso
          </h1>
          <p className="text-gray-600 mt-1">
            Selecione um curso e filtre os professores
            vinculados.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] md:items-end">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                Curso
              </label>
              <Select
                value={selectedCourseName}
                onValueChange={handleCourseChange}
                disabled={loadingCursos}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      loadingCursos
                        ? "Carregando cursos..."
                        : "Selecione um curso"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {cursos.map((curso) => (
                    <SelectItem
                      key={curso.courseCode}
                      value={curso.courseName}
                    >
                      {curso.courseName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <label
                htmlFor="professor-search"
                className="text-sm font-medium text-gray-700"
              >
                Buscar professor
              </label>
              <Input
                id="professor-search"
                placeholder="Nome, email ou matrícula"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
              />
            </div>
            <Button
              variant="outline"
              onClick={handleClearFilters}
              className="w-full md:w-auto"
            >
              Limpar filtros
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg">
          {loadingProfessores ? (
            <div className="py-12 text-center text-gray-600">
              Buscando professores...
            </div>
          ) : !selectedCourseName ? (
            <div className="py-12 text-center text-gray-600">
              Selecione um curso para visualizar os
              professores.
            </div>
          ) : (
            <DataTable
              columns={professorColumns}
              data={filteredProfessores}
            />
          )}
        </div>
      </div>
    </PageLayout>
  );
}
