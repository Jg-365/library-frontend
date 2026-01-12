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
import { useAuth as useAuthContext } from "@/store/AuthContext";

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
  const { user } = useAuthContext();
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

  // Normalize perfil field (backend may use different property names)
  const perfilUsuario =
    user?.role ||
    (user as any).perfil ||
    (user as any).tipoAcesso;

  // Verificar se usuário é admin ou bibliotecário
  const isAdminOrLibrarian =
    perfilUsuario === "ADMIN" ||
    perfilUsuario === "BIBLIOTECARIO";

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
          <CustomModalTitle className="text-2xl font-bold bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-500 bg-clip-text text-transparent">
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
          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/60 bg-white/90 px-4 py-3 shadow-sm shadow-slate-200 dark:border-slate-800/80 dark:bg-slate-900/70 dark:shadow-none sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <Hash className="h-5 w-5 text-sky-600" />
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
              <Users className="h-5 w-5 text-sky-600" />
              <h3 className="font-semibold text-lg">
                Autores
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {autoresList && autoresList.length > 0 ? (
                autoresList.map((autor, index) => (
                  <Badge
                    key={index}
                    variant="neutral"
                    className="px-3 py-1 text-sm font-medium"
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
                <Building2 className="h-5 w-5 text-sky-600" />
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
                <Calendar className="h-5 w-5 text-sky-600" />
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
              <Tag className="h-5 w-5 text-sky-600" />
              <h3 className="font-semibold">Categoria</h3>
            </div>
            {livro.categoria ? (
              <Badge
                variant="secondary"
                className="px-3 py-1 text-sm font-medium"
              >
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
              <BookOpen className="h-5 w-5 text-sky-600" />
              <h3 className="font-semibold">
                Disponibilidade
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-500 bg-clip-text text-transparent">
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
          <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-4 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/70">
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



