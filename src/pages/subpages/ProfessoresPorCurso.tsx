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
      <div className="text-sm text-gray-600 dark:text-slate-300">
        {row.original.username ?? row.original.email}
      </div>
    ),
  },
  {
    accessorKey: "workRegime",
    header: "Regime",
    cell: ({ row }) => (
      <div className="text-sm text-gray-600 dark:text-slate-300">
        {row.original.workRegime ?? "--"}
      </div>
    ),
  },
];

export function ProfessoresPorCurso() {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [selectedCourseName, setSelectedCourseName] =
    useState("");
  const [selectedCourseCode, setSelectedCourseCode] =
    useState<number | null>(null);
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
    const selectedCourse = cursos.find(
      (curso) => curso.courseName === selectedCourseName
    );
    setSelectedCourseCode(
      selectedCourse?.courseCode ?? null
    );
  }, [cursos, selectedCourseName]);

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
            selectedCourseName,
            selectedCourseCode ?? undefined
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
  }, [selectedCourseName, selectedCourseCode]);

  const filteredProfessores = useMemo(() => {
    if (!searchTerm.trim()) {
      return [...professores].sort((a, b) =>
        String(a.name ?? a.nome ?? "").localeCompare(
          String(b.name ?? b.nome ?? ""),
          "pt-BR"
        )
      );
    }

    const normalizedTerm = searchTerm
      .trim()
      .toLowerCase();
    return professores
      .filter((professor) => {
        const name = professor.name ?? professor.nome ?? "";
        const email =
          professor.username ?? professor.email ?? "";
        const enrollment =
          professor.enrollment ?? professor.id ?? "";
        return (
          String(name).toLowerCase().includes(normalizedTerm) ||
          String(email).toLowerCase().includes(normalizedTerm) ||
          String(enrollment).includes(normalizedTerm)
        );
      })
      .sort((a, b) =>
        String(a.name ?? a.nome ?? "").localeCompare(
          String(b.name ?? b.nome ?? ""),
          "pt-BR"
        )
      );
  }, [professores, searchTerm]);

  const handleCourseChange = (value: string) => {
    setSelectedCourseName(value);
    const selectedCourse = cursos.find(
      (curso) => curso.courseName === value
    );
    setSelectedCourseCode(
      selectedCourse?.courseCode ?? null
    );
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
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-500 bg-clip-text text-transparent">
            Professores por Curso
          </h1>
          <p className="text-gray-600 mt-1 dark:text-slate-300">
            Selecione um curso e filtre os professores
            vinculados.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-4 mb-4 dark:bg-slate-900 dark:text-slate-100">
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] md:items-end">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-slate-200">
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
                className="text-sm font-medium text-gray-700 dark:text-slate-200"
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

        <div className="bg-white rounded-lg shadow-lg dark:bg-slate-900 dark:text-slate-100">
          {loadingProfessores ? (
            <div className="py-12 text-center text-gray-600 dark:text-slate-300">
              Buscando professores...
            </div>
          ) : !selectedCourseName ? (
            <div className="py-12 text-center text-gray-600 dark:text-slate-300">
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



