import { useNavigate } from "react-router-dom";
import { useAuth as useAuthContext } from "@/store/AuthContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MdBlock } from "react-icons/md";

interface AccessDeniedDialogProps {
  open: boolean;
  onClose: () => void;
  message?: string;
}

export function AccessDeniedDialog({
  open,
  onClose,
  message = "Você não tem permissão para acessar esta página.",
}: AccessDeniedDialogProps) {
  const navigate = useNavigate();
  const { user } = useAuthContext();

  const handleGoBack = () => {
    onClose();
    if (user?.perfil) {
      // Redireciona para o dashboard do usuário
      const dashboards = {
        ALUNO: "/user/dashboard",
        PROFESSOR: "/user/dashboard",
        BIBLIOTECARIO: "/bibliotecario/dashboard",
        ADMINISTRADOR: "/admin/dashboard",
      };
      navigate(dashboards[user.perfil] || "/");
    } else {
      navigate("/login");
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-red-100 rounded-full">
              <MdBlock className="h-6 w-6 text-red-600" />
            </div>
            <AlertDialogTitle className="text-2xl">
              Acesso Negado
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base">
            {message}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={handleGoBack}>
            Voltar ao Meu Painel
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
