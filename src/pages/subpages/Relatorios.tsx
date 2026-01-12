import { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { PageLayout } from "@/components/layouts";
import { PageBreadcrumb } from "@/components/layouts/PageBreadcrumb";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart3,
  Download,
  FileText,
  TrendingUp,
  Users,
  BookOpen,
  Calendar,
  FileDown,
} from "lucide-react";
import { toast } from "sonner";
import {
  reportsService,
  type ReportFormat,
  type ReportType,
} from "@/services/reportsService";
import { livrosService } from "@/services/livrosService";
import { reservasService } from "@/services/reservasService";
import { usuariosService } from "@/services/usuariosService";
import type { Livro, Reserva } from "@/types";

const RELATORIOS_DISPONIVEIS = [
  {
    id: 1,
    titulo: "Relatório de Empréstimos",
    descricao:
      "Resumo completo de todos os empréstimos do período",
    icon: FileText,
    tipo: "emprestimos",
  },
  {
    id: 2,
    titulo: "Relatório de Usuários",
    descricao:
      "Estatísticas e atividades dos usuários cadastrados",
    icon: Users,
    tipo: "usuarios",
  },
  {
    id: 3,
    titulo: "Relatório de Acervo",
    descricao:
      "Inventário completo de livros e categorias",
    icon: BookOpen,
    tipo: "acervo",
  },
  {
    id: 4,
    titulo: "Relatório de Reservas",
    descricao: "Análise de reservas ativas e concluídas",
    icon: Calendar,
    tipo: "reservas",
  },
  {
    id: 5,
    titulo: "Relatório de Performance",
    descricao: "Métricas e KPIs do sistema de biblioteca",
    icon: TrendingUp,
    tipo: "performance",
  },
] as const;

const RELATORIOS_ENDPOINTS = [
  {
    tipo: "emprestimos",
    endpoint: "GET /loans/users",
  },
  {
    tipo: "usuarios",
    endpoint: "GET /users/all (admin/bibliotecário) | GET /users/me",
  },
  {
    tipo: "acervo",
    endpoint: "GET /books",
  },
  {
    tipo: "reservas",
    endpoint: "GET /reserves/users",
  },
  {
    tipo: "performance",
    endpoint: "Agregado local (loans/users/books/reserves)",
  },
] as const;

export function Relatorios() {
  const [carregando, setCarregando] = useState(false);
  const [resumo, setResumo] = useState({
    totalEmprestimos: 0,
    totalLivros: 0,
    totalUsuarios: 0,
    usuariosAtivos: 0,
  });
  const [erroResumo, setErroResumo] =
    useState<string | null>(null);
  const [livros, setLivros] = useState<Livro[]>([]);
  const [carregandoLivros, setCarregandoLivros] =
    useState(false);
  const [agrupador, setAgrupador] = useState<
    "categoria" | "subcategoria" | "editora" | "ano" | "autor"
  >("categoria");
  const [filtroGrupo, setFiltroGrupo] = useState("");
  const [buscaLivroReserva, setBuscaLivroReserva] =
    useState("");
  const [livroSelecionado, setLivroSelecionado] =
    useState<Livro | null>(null);
  const [reservasLivro, setReservasLivro] = useState<
    Reserva[]
  >([]);
  const [carregandoReservas, setCarregandoReservas] =
    useState(false);
  const [usuariosReserva, setUsuariosReserva] = useState<
    Record<number, string>
  >({});
  const location = useLocation();

  const getPerfil = () => {
    if (location.pathname.startsWith("/admin"))
      return "ADMIN";
    if (location.pathname.startsWith("/bibliotecario"))
      return "BIBLIOTECARIO";
    return "USUARIO";
  };

  const perfil = getPerfil();

  useEffect(() => {
    let ativo = true;
    const carregarLivros = async () => {
      try {
        setCarregandoLivros(true);
        const livrosArray = await livrosService.listarTodos({
          force: true,
        });
        if (ativo) {
          setLivros(livrosArray);
        }
      } catch (error) {
        if (ativo) {
          toast.error("Erro ao carregar livros do acervo");
        }
      } finally {
        if (ativo) {
          setCarregandoLivros(false);
        }
      }
    };

    carregarLivros();
    return () => {
      ativo = false;
    };
  }, []);

  useEffect(() => {
    let ativo = true;
    const carregarResumo = async () => {
      setErroResumo(null);
      try {
        const dados = await reportsService.getSummary(perfil);
        if (ativo) {
          setResumo(dados);
        }
      } catch (error) {
        if (ativo) {
          setErroResumo(
            "Não foi possível carregar o resumo dos relatórios."
          );
        }
      }
    };

    carregarResumo();
    return () => {
      ativo = false;
    };
  }, [perfil]);

  const handleGerarRelatorio = async (
    tipo: ReportType,
    titulo: string,
    formato: ReportFormat
  ) => {
    setCarregando(true);
    try {
      const dataset = await reportsService.getReportDataset(
        tipo,
        perfil
      );

      reportsService.downloadReport(dataset, formato);

      toast.success("Relatório gerado com sucesso!", {
        description: `${titulo} pronto para download (${formato.toUpperCase()})`,
      });
    } catch (error) {
      toast.error("Erro ao gerar relatório", {
        description:
          "Não foi possível gerar o relatório agora. Tente novamente.",
      });
    } finally {
      setCarregando(false);
    }
  };

  const gruposAcervo = useMemo(() => {
    const map = new Map<string, Livro[]>();
    const normalizedFilter = filtroGrupo
      .trim()
      .toLowerCase();

    const addToGroup = (key: string, livro: Livro) => {
      const groupKey = key || "Sem informação";
      const list = map.get(groupKey) ?? [];
      list.push(livro);
      map.set(groupKey, list);
    };

    livros.forEach((livro) => {
      if (agrupador === "categoria") {
        addToGroup(livro.categoria ?? "Sem categoria", livro);
        return;
      }
      if (agrupador === "subcategoria") {
        addToGroup(
          livro.subcategoria ?? "Sem subcategoria",
          livro
        );
        return;
      }
      if (agrupador === "editora") {
        addToGroup(livro.editora ?? "Sem editora", livro);
        return;
      }
      if (agrupador === "ano") {
        addToGroup(
          livro.ano ? String(livro.ano) : "Sem ano",
          livro
        );
        return;
      }
      if (agrupador === "autor") {
        const autores = (livro.autores || [])
          .map((autor) => autor?.nome)
          .filter(Boolean);
        if (autores.length === 0) {
          addToGroup("Sem autor", livro);
          return;
        }
        autores.forEach((autor) => {
          addToGroup(String(autor), livro);
        });
      }
    });

    const groupsArray = Array.from(map.entries())
      .filter(([key]) =>
        normalizedFilter
          ? key.toLowerCase().includes(normalizedFilter)
          : true
      )
      .map(([key, items]) => ({
        key,
        items: [...items].sort((a, b) =>
          String(a.titulo ?? "").localeCompare(
            String(b.titulo ?? ""),
            "pt-BR"
          )
        ),
      }))
      .sort((a, b) =>
        a.key.localeCompare(b.key, "pt-BR")
      );

    return groupsArray;
  }, [agrupador, filtroGrupo, livros]);

  const livrosFiltradosReserva = useMemo(() => {
    const termo = buscaLivroReserva.trim().toLowerCase();
    if (!termo) return livros;
    return livros.filter((livro) => {
      const titulo = livro.titulo ?? "";
      return (
        livro.isbn?.toLowerCase().includes(termo) ||
        titulo.toLowerCase().includes(termo)
      );
    });
  }, [buscaLivroReserva, livros]);

  const carregarReservasDoLivro = async (isbn?: string) => {
    const resolvedIsbn = isbn ?? livroSelecionado?.isbn;
    if (!resolvedIsbn) {
      toast.error("Selecione um livro para consultar reservas.");
      return;
    }

    try {
      setCarregandoReservas(true);
      const reservas = await reservasService.listarPorLivro(
        resolvedIsbn
      );
      setReservasLivro(reservas);

      if (perfil === "ADMIN" || perfil === "BIBLIOTECARIO") {
        const enrollments = Array.from(
          new Set(
            reservas
              .map((reserva) => reserva.usuarioId)
              .filter(Boolean)
          )
        );
        const results = await Promise.allSettled(
          enrollments.map((enrollment) =>
            usuariosService.buscarPorEnrollment(
              String(enrollment)
            )
          )
        );
        const usersMap: Record<number, string> = {};
        results.forEach((result, index) => {
          if (result.status === "fulfilled") {
            usersMap[enrollments[index]] =
              result.value.name ||
              result.value.username ||
              String(enrollments[index]);
          }
        });
        setUsuariosReserva(usersMap);
      } else {
        setUsuariosReserva({});
      }
    } catch (error) {
      toast.error("Erro ao carregar reservas do livro");
    } finally {
      setCarregandoReservas(false);
    }
  };

  return (
    <PageLayout perfil={perfil}>
      <div className="max-w-7xl mx-auto space-y-6">
        <PageBreadcrumb
          items={[
            {
              label: "Início",
              href:
                perfil === "ADMIN"
                  ? "/admin/dashboard"
                  : perfil === "BIBLIOTECARIO"
                  ? "/bibliotecario/dashboard"
                  : "/usuario",
            },
            { label: "Relatórios" },
          ]}
          backTo={
            perfil === "ADMIN"
              ? "/admin/dashboard"
              : perfil === "BIBLIOTECARIO"
              ? "/bibliotecario/dashboard"
              : "/usuario"
          }
        />
        {/* Título da Página */}
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-500 bg-clip-text text-transparent flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-sky-600" />
            Relatórios
          </h2>
          <p className="text-sm text-gray-600 dark:text-slate-300 mt-1">
            Gere relatórios detalhados sobre o sistema de
            biblioteca
          </p>
        </div>

        {/* Estatísticas Rápidas */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Empréstimos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {resumo.totalEmprestimos}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Dados consolidados do período atual
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Livros no Acervo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {resumo.totalLivros}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Total de registros disponíveis
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Usuários Ativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {resumo.usuariosAtivos}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {resumo.totalUsuarios > 0
                  ? `${resumo.totalUsuarios} cadastrados no total`
                  : "Sem usuários cadastrados"}
              </p>
            </CardContent>
          </Card>
        </div>

        {erroResumo && (
          <Card>
            <CardContent className="pt-6 text-sm text-destructive">
              {erroResumo}
            </CardContent>
          </Card>
        )}

        {/* Relatórios Disponíveis */}
        <div>
          <h3 className="text-xl font-semibold mb-4">
            Relatórios Disponíveis
          </h3>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {RELATORIOS_DISPONIVEIS.map((relatorio) => {
              const Icon = relatorio.icon;
              return (
                <Card
                  key={relatorio.id}
                  className="hover:shadow-lg transition-all duration-200"
                >
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-sky-100 rounded-lg">
                        <Icon className="h-5 w-5 text-sky-600" />
                      </div>
                      <CardTitle className="text-lg">
                        {relatorio.titulo}
                      </CardTitle>
                    </div>
                    <CardDescription>
                      {relatorio.descricao}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      className="w-full gap-2"
                      onClick={() =>
                        handleGerarRelatorio(
                          relatorio.tipo,
                          relatorio.titulo,
                          "pdf"
                        )
                      }
                      disabled={carregando}
                    >
                      <Download className="h-4 w-4" />
                      {carregando
                        ? "Gerando..."
                        : "Gerar PDF"}
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      onClick={() =>
                        handleGerarRelatorio(
                          relatorio.tipo,
                          relatorio.titulo,
                          "csv"
                        )
                      }
                      disabled={carregando}
                    >
                      <FileDown className="h-4 w-4" />
                      {carregando
                        ? "Gerando..."
                        : "Baixar CSV"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Informações Adicionais */}
        <Card>
          <CardHeader>
            <CardTitle>
              Informações sobre Relatórios
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              • Os relatórios são gerados diretamente a partir
              dos dados retornados pela API
            </p>
            <p className="text-sm text-muted-foreground">
              • PDF e CSV ficam disponíveis para download
              imediato após a geração
            </p>
            <p className="text-sm text-muted-foreground">
              • Para perfis administrativos, relatórios de
              usuários usam o endpoint completo
            </p>
          </CardContent>
        </Card>

        {/* Endpoints */}
        <Card>
          <CardHeader>
            <CardTitle>
              Endpoints de Relatórios
            </CardTitle>
            <CardDescription>
              Base atual usada para geração dos relatórios
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {RELATORIOS_ENDPOINTS.map((item) => (
              <p
                key={item.tipo}
                className="text-sm text-muted-foreground"
              >
                • {item.tipo}: {item.endpoint}
              </p>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Listagens do Acervo</CardTitle>
            <CardDescription>
              Agrupe os livros por categoria, subcategoria,
              editora, ano ou autor
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Agrupar por
                </label>
                <Select
                  value={agrupador}
                  onValueChange={(value) =>
                    setAgrupador(
                      value as
                        | "categoria"
                        | "subcategoria"
                        | "editora"
                        | "ano"
                        | "autor"
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="categoria">
                      Categoria
                    </SelectItem>
                    <SelectItem value="subcategoria">
                      Subcategoria
                    </SelectItem>
                    <SelectItem value="editora">
                      Editora
                    </SelectItem>
                    <SelectItem value="ano">Ano</SelectItem>
                    <SelectItem value="autor">
                      Autor
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Filtrar grupo
                </label>
                <Input
                  placeholder="Ex: Computação, 2023, Machado"
                  value={filtroGrupo}
                  onChange={(event) =>
                    setFiltroGrupo(event.target.value)
                  }
                />
              </div>
            </div>

            {carregandoLivros ? (
              <p className="text-sm text-muted-foreground">
                Carregando livros do acervo...
              </p>
            ) : gruposAcervo.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum grupo encontrado para o filtro.
              </p>
            ) : (
              <div className="space-y-4">
                {gruposAcervo.map((grupo) => (
                  <div
                    key={grupo.key}
                    className="rounded-lg border p-4"
                  >
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div>
                        <p className="font-semibold">
                          {grupo.key}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {grupo.items.length} livro(s)
                        </p>
                      </div>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {grupo.items.map((livro) => (
                        <div
                          key={`${grupo.key}-${livro.isbn}`}
                          className="text-sm text-muted-foreground"
                        >
                          <span className="font-medium text-foreground">
                            {livro.titulo}
                          </span>{" "}
                          · {livro.isbn}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reservas por Livro</CardTitle>
            <CardDescription>
              Consulte as reservas feitas para um livro
              específico por ISBN ou nome
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] md:items-end">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Buscar livro
                </label>
                <Input
                  placeholder="Digite ISBN ou título"
                  value={buscaLivroReserva}
                  onChange={(event) =>
                    setBuscaLivroReserva(event.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Selecionar livro
                </label>
                <Select
                  value={livroSelecionado?.isbn}
                  onValueChange={(value) => {
                    const livro = livros.find(
                      (item) => item.isbn === value
                    );
                    setLivroSelecionado(livro ?? null);
                    setReservasLivro([]);
                    setUsuariosReserva({});
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um livro" />
                  </SelectTrigger>
                  <SelectContent>
                    {livrosFiltradosReserva.map((livro) => (
                      <SelectItem key={livro.isbn} value={livro.isbn}>
                        {livro.titulo} ({livro.isbn})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="outline"
                onClick={() =>
                  carregarReservasDoLivro(
                    livroSelecionado?.isbn
                  )
                }
                disabled={carregandoReservas}
              >
                {carregandoReservas
                  ? "Carregando..."
                  : "Consultar"}
              </Button>
            </div>

            {!livroSelecionado ? (
              <p className="text-sm text-muted-foreground">
                Selecione um livro para visualizar as reservas.
              </p>
            ) : carregandoReservas ? (
              <p className="text-sm text-muted-foreground">
                Carregando reservas do livro...
              </p>
            ) : reservasLivro.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhuma reserva encontrada para este livro.
              </p>
            ) : (
              <div className="space-y-3">
                {reservasLivro.map((reserva) => {
                  const usuarioNome = usuariosReserva[
                    reserva.usuarioId
                  ];
                  return (
                    <div
                      key={reserva.id}
                      className="rounded-lg border p-4 text-sm"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-medium">
                            Usuário:{" "}
                            {usuarioNome
                              ? `${usuarioNome} (#${reserva.usuarioId})`
                              : `Matrícula #${reserva.usuarioId}`}
                          </p>
                          <p className="text-muted-foreground">
                            Reserva em{" "}
                            {reserva.dataReserva
                              ? new Date(
                                  reserva.dataReserva
                                ).toLocaleDateString("pt-BR")
                              : "-"}
                          </p>
                        </div>
                        <div className="text-muted-foreground">
                          Status: {reserva.status ?? "ATIVA"}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}

export default Relatorios;



