import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Reserva } from "@/types";
import { Clock, BookOpen, Calendar, X } from "lucide-react";

interface ReservaCardProps {
  reserva: Reserva;
  onCancelar?: (reserva: Reserva) => void;
  onVerDetalhes?: (reserva: Reserva) => void;
}

export function ReservaCard({
  reserva,
  onCancelar,
  onVerDetalhes,
}: ReservaCardProps) {
  const [tempoRestante, setTempoRestante] =
    useState<string>("");
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const calcularTempoRestante = () => {
      if (reserva.status !== "ATIVA") {
        setTempoRestante("");
        return;
      }

      const agora = new Date();
      const prazo = new Date(reserva.prazoRetirada);
      const diferenca = prazo.getTime() - agora.getTime();

      if (diferenca <= 0) {
        setTempoRestante("Prazo expirado");
        return;
      }

      const dias = Math.floor(
        diferenca / (1000 * 60 * 60 * 24)
      );
      const horas = Math.floor(
        (diferenca % (1000 * 60 * 60 * 24)) /
          (1000 * 60 * 60)
      );
      const minutos = Math.floor(
        (diferenca % (1000 * 60 * 60)) / (1000 * 60)
      );
      const segundos = Math.floor(
        (diferenca % (1000 * 60)) / 1000
      );

      if (dias > 0) {
        setTempoRestante(
          `${dias}d ${horas}h ${minutos}m ${segundos}s`
        );
      } else if (horas > 0) {
        setTempoRestante(
          `${horas}h ${minutos}m ${segundos}s`
        );
      } else if (minutos > 0) {
        setTempoRestante(`${minutos}m ${segundos}s`);
      } else {
        setTempoRestante(`${segundos}s`);
      }
    };

    calcularTempoRestante();
    const intervalo = setInterval(
      calcularTempoRestante,
      1000
    );

    return () => clearInterval(intervalo);
  }, [reserva.prazoRetirada, reserva.status]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ATIVA":
        return "bg-green-100 text-green-800 border-green-300";
      case "CONCLUIDA":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "CANCELADA":
        return "bg-gray-100 text-gray-800 border-gray-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString("pt-BR");
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base line-clamp-2 mb-1">
              {reserva.livro?.titulo ||
                "Livro não encontrado"}
            </h3>
            {reserva.livro?.autores && (
              <p className="text-sm text-muted-foreground line-clamp-1">
                {reserva.livro.autores
                  .map((autor: { nome: any }) => autor.nome)
                  .join(", ")}
              </p>
            )}
          </div>
          <Badge
            variant="outline"
            className={getStatusColor(reserva.status)}
          >
            {reserva.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Capa do Livro - Miniatura */}
        <div className="relative h-32 bg-gradient-to-br from-blue-400 via-indigo-400 to-purple-500 rounded-lg overflow-hidden">
          {reserva.livro?.imagemCapa && !imageError ? (
            <>
              <img
                src={reserva.livro?.imagemCapa}
                alt={`Capa do livro ${
                  reserva.livro?.titulo ||
                  reserva.livroIsbn ||
                  "não informada"
                }`}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
              <div className="absolute inset-0 bg-black/10" />
            </>
          ) : (
            <>
              <div className="absolute inset-0 bg-black/10" />
              <div className="absolute inset-0 flex items-center justify-center">
                <BookOpen className="h-12 w-12 text-white opacity-80" />
              </div>
            </>
          )}
        </div>

        {/* Informações da Reserva */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              Reservado em:{" "}
              {formatarData(reserva.dataReserva)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              Retirar até:{" "}
              {formatarData(reserva.prazoRetirada)}
            </span>
          </div>

          {/* Tempo Restante */}
          {reserva.status === "ATIVA" && tempoRestante && (
            <div
              className={`flex items-center gap-2 font-semibold ${
                tempoRestante === "Prazo expirado"
                  ? "text-red-600"
                  : "text-blue-600"
              }`}
            >
              <Clock className="h-4 w-4" />
              <span>
                {tempoRestante === "Prazo expirado"
                  ? tempoRestante
                  : `Tempo restante: ${tempoRestante}`}
              </span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="gap-2 pt-0">
        {onVerDetalhes && (
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onVerDetalhes(reserva)}
          >
            Ver Detalhes
          </Button>
        )}
        {onCancelar && reserva.status === "ATIVA" && (
          <Button
            variant="destructive"
            size="sm"
            className="flex-1"
            onClick={() => onCancelar(reserva)}
          >
            <X className="h-4 w-4 mr-1" />
            Cancelar
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
