import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PageLayout } from "@/components/layouts";
import { PageBreadcrumb } from "@/components/layouts/PageBreadcrumb";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Calendar,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import { reservasService as reservasApi } from "@/services/reservasService";
import type { Reserva, Perfil } from "@/types";
import { getErrorMessage } from "@/lib/errorMessage";
import { useAuth } from "@/store/AuthContext";

export default function MinhasReservas() {
  const location = useLocation();
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Parse and format dates robustly (accepts string | number | Date)
  const parseToDate = (
    value?: string | number | Date
  ): Date | null => {
    if (value === undefined || value === null) return null;
    if (value instanceof Date) {
      if (isNaN(value.getTime())) return null;
      return value;
    }
    // handle numbers (timestamps) and strings
    const d =
      typeof value === "number"
        ? new Date(value)
        : new Date(String(value));
    if (isNaN(d.getTime())) return null;
    return d;
  };

  const formatDate = (value?: string | number | Date) => {
    const d = parseToDate(value);
    if (!d) return "-";
    return d.toLocaleDateString("pt-BR");
  };

  const getPerfil = (): Perfil => {
    if (location.pathname.startsWith("/admin")) {
      return "ADMIN";
    }
    if (location.pathname.startsWith("/bibliotecario")) {
      return "BIBLIOTECARIO";
    }
    return "USUARIO";
  };

  const getBasePath = () => {
    if (location.pathname.startsWith("/admin"))
      return "/admin/dashboard";
    if (location.pathname.startsWith("/bibliotecario"))
      return "/bibliotecario/dashboard";
    return "/usuario";
  };

  const perfil = getPerfil();
  const { user } = useAuth();

  // Normaliza perfis vindos do backend: ALUNO/PROFESSOR => USUARIO
  const normalizePerfil = (raw?: string | null): Perfil => {
    if (!raw) return getPerfil();
    const r = raw.toString().toUpperCase();
    if (r === "ALUNO" || r === "PROFESSOR")
      return "USUARIO";
    if (r === "BIBLIOTECARIO") return "BIBLIOTECARIO";
    if (r === "ADMIN") return "ADMIN";
    // fallback to USUARIO for unknown values
    return "USUARIO";
  };

  const rawPerfil =
    (user &&
      ((user.role as string) ||
        (user as any).perfil ||
        (user as any).tipoAcesso)) ||
    undefined;

  const currentPerfil: Perfil = normalizePerfil(rawPerfil);

  console.debug(
    "MinhasReservas currentPerfil:",
    currentPerfil,
    "raw:",
    rawPerfil
  );

  const fetchReservas = async () => {
    try {
      setIsLoading(true);
      const reservasArray =
        await reservasApi.listarPorUsuario();
      setReservas(reservasArray);
    } catch (error: any) {
      toast.error("Erro ao carregar reservas");
      console.error("Erro ao buscar reservas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReservas();
  }, []);

  const handleCancelar = (reserva: Reserva) => {
    setReservaSelecionada(reserva);
  };

  const confirmarCancelamento = async () => {
    if (!reservaSelecionada) return;

    try {
      await reservasApi.deletar(
        reservaSelecionada.id
      );
      toast.success("Reserva cancelada com sucesso!");
      setReservaSelecionada(null);
      fetchReservas();
    } catch (error: any) {
      const message = getErrorMessage(
        error.response?.data?.message,
        "Erro ao cancelar reserva"
      );
      toast.error(message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ATIVA":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "CONCLUIDA":
        return "bg-green-100 text-green-800 border-green-300";
      case "CANCELADA":
        return "bg-gray-100 text-gray-800 border-gray-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <PageLayout perfil={getPerfil()}>
      <div className="max-w-7xl mx-auto">
        <PageBreadcrumb
          items={[
            {
              label: "Início",
              href: getBasePath(),
            },
            { label: "Minhas Reservas" },
          ]}
          backTo={getBasePath()}
        />
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Minhas Reservas
          </h1>
          <p className="text-gray-600 mt-1">
            Visualize e gerencie suas reservas de livros
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              Carregando reservas...
            </p>
          </div>
        ) : reservas.length === 0 ? (
          <Card className="shadow-lg">
            <CardContent className="py-12 text-center">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-700">
                Nenhuma reserva encontrada
              </p>
              <p className="text-gray-500 mt-1">
                Você ainda não possui reservas de livros
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {reservas.map((reserva) => (
              <Card key={reserva.id} className="shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                      {reserva.livro?.titulo ||
                        reserva.livroIsbn}
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className={getStatusColor(
                        reserva.status || ""
                      )}
                    >
                      {reserva.status}
                    </Badge>
                  </div>
                  <CardDescription>
                    {(
                      (reserva.livro?.autores ||
                        []) as any[]
                    )
                      .map((a) => a?.nome || "")
                      .filter(Boolean)
                      .join(", ") || reserva.livroIsbn}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <p className="text-gray-500">
                        Data da Reserva
                      </p>
                      <p className="font-medium flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(reserva.dataReserva)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">
                        Prazo de Retirada
                      </p>
                      <p className="font-medium">
                        {formatDate(reserva.prazoRetirada)}
                      </p>
                    </div>
                  </div>
                  {/* Cancel button removed per UX decision */}
                  {reserva.status === "CONCLUIDA" && (
                    <div className="flex items-center gap-2 text-green-600 text-sm">
                      <CheckCircle className="h-4 w-4" />
                      <span>
                        Livro retirado com sucesso
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Confirmation dialog removed */}
      </div>
    </PageLayout>
  );
}
