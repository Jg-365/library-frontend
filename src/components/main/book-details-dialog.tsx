import {
  CustomModal,
  CustomModalContent,
  CustomModalDescription,
  CustomModalHeader,
  CustomModalTitle,
} from "@/components/ui/custom-modal";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import type { Livro } from "@/types";
import {
  BookOpen,
  Calendar,
  Building2,
  Hash,
  Users,
  Tag,
  Copy,
  CheckCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { CopiasManager } from "./CopiasManager";
import { useAuth } from "@/store/AuthContext";

interface BookDetailsDialogProps {
  livro: Livro | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BookDetailsDialog({
  livro,
  open,
  onOpenChange,
}: BookDetailsDialogProps) {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  if (!livro) return null;

  const autoresList = (livro.autores ||
    (livro as any).authors ||
    []) as any[];
  const imagemCapa =
    livro.imagemCapa || (livro as any).imageUrl || "";
  const qtdExemplares =
    livro.quantidadeExemplares ??
    (livro as any).copies ??
    (livro as any).availableCopies ??
    0;

  // Verificar se usuário é admin ou bibliotecário
  const isAdminOrLibrarian =
    user?.tipoAcesso === "ADMIN" ||
    user?.tipoAcesso === "BIBLIOTECARIO";

  const handleCopyISBN = () => {
    navigator.clipboard.writeText(livro.isbn);
    setCopied(true);
    toast.success(
      "ISBN copiado para a área de transferência!"
    );
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <CustomModal open={open} onOpenChange={onOpenChange}>
      <CustomModalContent
        className="max-w-4xl max-h-[90vh] overflow-y-auto"
        showCloseButton
        onClose={() => onOpenChange(false)}
      >
        <CustomModalHeader>
          <CustomModalTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {livro.titulo ??
              (livro as any).title ??
              "Título não informado"}
          </CustomModalTitle>
          <CustomModalDescription className="text-base">
            Informações detalhadas do livro
          </CustomModalDescription>
        </CustomModalHeader>

        <div className="space-y-6">
          {/* ISBN com botão de copiar */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Hash className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-xs text-muted-foreground">
                  ISBN
                </p>
                <p className="font-mono text-lg font-semibold">
                  {livro.isbn}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyISBN}
              className="gap-2"
            >
              {copied ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copiar
                </>
              )}
            </Button>
          </div>

          <Separator />

          {/* Autores */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-lg">
                Autores
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {autoresList && autoresList.length > 0 ? (
                autoresList.map((autor, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="px-3 py-1 text-sm"
                  >
                    {autor?.nome || autor?.name || autor}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">
                  Autor desconhecido
                </span>
              )}
            </div>
          </div>

          <Separator />

          {/* Editora e Ano */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold">Editora</h3>
              </div>
              <p className="text-muted-foreground">
                {livro.editora ||
                  (livro as any).publisher ||
                  "Editora não informada"}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold">
                  Ano de Publicação
                </h3>
              </div>
              <p className="text-muted-foreground">
                {livro.ano ||
                  (livro as any).releaseYear ||
                  "Ano não informado"}
              </p>
            </div>
          </div>

          <Separator />

          {/* Categoria */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold">Categoria</h3>
            </div>
            {livro.categoria ? (
              <Badge className="px-3 py-1 text-sm bg-gradient-to-r from-blue-600 to-indigo-600">
                {livro.categoria}
              </Badge>
            ) : (
              <span className="text-sm text-muted-foreground">
                Categoria não informada
              </span>
            )}
          </div>

          <Separator />

          {/* Quantidade de Exemplares */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold">
                Disponibilidade
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {qtdExemplares}
              </span>
              <div>
                <p className="text-sm font-medium">
                  {qtdExemplares === 1
                    ? "exemplar disponível"
                    : "exemplares disponíveis"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {qtdExemplares > 5
                    ? "Alta disponibilidade"
                    : qtdExemplares > 2
                    ? "Disponibilidade média"
                    : "Baixa disponibilidade"}
                </p>
              </div>
            </div>
          </div>

          {/* Status de disponibilidade visual */}
          <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                Status do Acervo
              </span>
              <Badge
                variant={
                  qtdExemplares > 0
                    ? "default"
                    : "destructive"
                }
                className={
                  qtdExemplares > 0
                    ? "bg-green-600 hover:bg-green-700"
                    : ""
                }
              >
                {qtdExemplares > 0
                  ? "Disponível"
                  : "Indisponível"}
              </Badge>
            </div>
          </div>

          {isAdminOrLibrarian && (
            <>
              <Separator />

              {/* Gerenciamento de Cópias - Apenas Admin/Bibliotecário */}
              <CopiasManager
                isbn={livro.isbn}
                tituloLivro={
                  livro.titulo ?? (livro as any).title ?? ""
                }
              />
            </>
          )}
        </div>
      </CustomModalContent>
    </CustomModal>
  );
}
