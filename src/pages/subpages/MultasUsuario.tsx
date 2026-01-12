import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { PageLayout } from "@/components/layouts";
import { PageBreadcrumb } from "@/components/layouts/PageBreadcrumb";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CircleDollarSign,
  Users,
  Clock,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import { multasService } from "@/services/multasService";
import { SelectUserDialog } from "@/components/main/SelectUserDialog";
import type { Multa, Perfil } from "@/types";
import { getErrorMessage } from "@/lib/errorMessage";

const formatCurrency = (value: number) =>
  value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

const formatDate = (value?: string) =>
  value
    ? new Date(value).toLocaleDateString("pt-BR")
    : "—";

const getPerfilFromPath = (pathname: string): Perfil => {
  if (pathname.startsWith("/admin")) return "ADMIN";
  if (pathname.startsWith("/bibliotecario"))
    return "BIBLIOTECARIO";
  return "ADMIN";
};

const getBasePath = (pathname: string) => {
  if (pathname.startsWith("/admin"))
    return "/admin/dashboard";
  if (pathname.startsWith("/bibliotecario"))
    return "/bibliotecario/dashboard";
  return "/admin/dashboard";
};

export function MultasUsuario() {
  const location = useLocation();
  const perfil = getPerfilFromPath(location.pathname);
  const basePath = getBasePath(location.pathname);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<
    number | null
  >(null);
  const [pendentes, setPendentes] = useState<Multa[]>([]);
  const [pagas, setPagas] = useState<Multa[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagandoId, setPagandoId] = useState<number | null>(
    null
  );

  const carregarMultas = async (userId: number) => {
    try {
      setLoading(true);
      const [pendentesResponse, pagasResponse] =
        await Promise.all([
          multasService.obterPendentesPorUsuario(
            String(userId)
          ),
          multasService.obterPagasPorUsuario(String(userId)),
        ]);
      setPendentes(pendentesResponse);
      setPagas(pagasResponse);
    } catch (error: any) {
      const message = getErrorMessage(
        error.response?.data?.message,
        "Erro ao carregar multas do usuário"
      );
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedUserId !== null) {
      carregarMultas(selectedUserId);
    } else {
      setPendentes([]);
      setPagas([]);
    }
  }, [selectedUserId]);

  const handlePagar = async (multaId: number) => {
    try {
      setPagandoId(multaId);
      const multaPaga = await multasService.pagar(
        multaId
      );
      setPendentes((prev) =>
        prev.filter((multa) => multa.id !== multaId)
      );
      setPagas((prev) => [multaPaga, ...prev]);
      toast.success("Multa paga com sucesso!");
    } catch (error: any) {
      const message = getErrorMessage(
        error.response?.data?.message,
        "Erro ao pagar multa"
      );
      toast.error(message);
    } finally {
      setPagandoId(null);
    }
  };

  return (
    <PageLayout perfil={perfil}>
      <div className="max-w-7xl mx-auto space-y-6">
        <PageBreadcrumb
          items={[
            { label: "Início", href: basePath },
            { label: "Multas do Usuário" },
          ]}
          backTo={basePath}
        />

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2 dark:text-slate-100">
              <CircleDollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              Multas do Usuário
            </h2>
            <p className="text-sm text-gray-600 mt-1 dark:text-slate-300">
              Consulte e quite multas pendentes por usuário.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(true)}
            >
              <Users className="h-4 w-4 mr-2" />
              Selecionar usuário
            </Button>
            {selectedUserId !== null && (
              <Button
                variant="ghost"
                onClick={() => setSelectedUserId(null)}
              >
                Limpar
              </Button>
            )}
          </div>
        </div>

        <Card className="shadow-lg dark:bg-slate-900 dark:text-slate-100">
          <CardHeader>
            <CardTitle className="text-base text-gray-900 dark:text-slate-100">
              Usuário selecionado
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-slate-300">
              {selectedUserId !== null
                ? `Matrícula #${selectedUserId}`
                : "Nenhum usuário selecionado."}
            </CardDescription>
          </CardHeader>
        </Card>

        {loading ? (
          <Card className="shadow-lg dark:bg-slate-900 dark:text-slate-100">
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4" />
              <p className="text-lg font-semibold text-gray-600 dark:text-slate-300">
                Carregando multas...
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="shadow-lg dark:bg-slate-900 dark:text-slate-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-slate-100">
                  <Clock className="h-5 w-5 text-orange-500" />
                  Pendentes
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-slate-300">
                  {pendentes.length} pendente(s)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedUserId === null ? (
                  <div className="text-center text-gray-500 dark:text-slate-400">
                    Selecione um usuário para visualizar as multas.
                  </div>
                ) : pendentes.length === 0 ? (
                  <div className="text-center text-gray-500 dark:text-slate-400">
                    Nenhuma multa pendente para este usuário.
                  </div>
                ) : (
                  pendentes.map((multa) => (
                    <div
                      key={multa.id}
                      className="rounded-lg border border-orange-100 bg-orange-50 p-4 dark:border-orange-500/30 dark:bg-orange-500/10"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-semibold text-gray-800 dark:text-slate-100">
                            {multa.motivoMulta}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-slate-300">
                            {multa.titulosLivros?.join(
                              ", "
                            ) || "Livro não informado"}
                          </p>
                        </div>
                        <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-200">
                          {formatCurrency(multa.valor)}
                        </Badge>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-slate-400">
                        <span>
                          Criada em {formatDate(multa.dataCriacao)}
                        </span>
                        <Button
                          size="sm"
                          onClick={() => handlePagar(multa.id)}
                          disabled={pagandoId === multa.id}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {pagandoId === multa.id
                            ? "Processando..."
                            : "Pagar"}
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="shadow-lg dark:bg-slate-900 dark:text-slate-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-slate-100">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Pagas
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-slate-300">
                  {pagas.length} quitada(s)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedUserId === null ? (
                  <div className="text-center text-gray-500 dark:text-slate-400">
                    Selecione um usuário para visualizar as multas.
                  </div>
                ) : pagas.length === 0 ? (
                  <div className="text-center text-gray-500 dark:text-slate-400">
                    Nenhuma multa paga para este usuário.
                  </div>
                ) : (
                  pagas.map((multa) => (
                    <div
                      key={multa.id}
                      className="rounded-lg border border-emerald-100 bg-emerald-50 p-4 dark:border-emerald-500/30 dark:bg-emerald-500/10"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-semibold text-gray-800 dark:text-slate-100">
                            {multa.motivoMulta}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-slate-300">
                            {multa.titulosLivros?.join(
                              ", "
                            ) || "Livro não informado"}
                          </p>
                        </div>
                        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200">
                          {formatCurrency(multa.valor)}
                        </Badge>
                      </div>
                      <div className="mt-3 text-xs text-gray-500 dark:text-slate-400">
                        Pago em {formatDate(multa.dataPagamento)}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <SelectUserDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSelectUser={(userId) => setSelectedUserId(userId)}
        title="Selecionar usuário"
        description="Escolha um usuário para consultar multas."
      />
    </PageLayout>
  );
}
