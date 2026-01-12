import { Routes, Route } from "react-router-dom";
import DashboardUsuario from "@/pages/subpages/DashboardUsuario";
import CatalogoLivros from "@/pages/subpages/CatalogoLivros";
import MeusEmprestimos from "@/pages/subpages/MeusEmprestimos";
import MinhasReservas from "@/pages/subpages/MinhasReservas";
import { MinhasMultas } from "@/pages/subpages/MinhasMultas";
import { PageLayout } from "@/components/layouts";

function UserDashboard() {
  return (
    <PageLayout perfil="USUARIO">
      <Routes>
        <Route index element={<DashboardUsuario />} />
        <Route path="livros" element={<CatalogoLivros />} />
        <Route
          path="emprestimos"
          element={<MeusEmprestimos />}
        />
        <Route
          path="reservas"
          element={<MinhasReservas />}
        />
        <Route path="multas" element={<MinhasMultas />} />
      </Routes>
    </PageLayout>
  );
}

export default UserDashboard;
