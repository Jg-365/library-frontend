import { Routes, Route } from "react-router-dom";
import DashboardUsuario from "@/pages/subpages/DashboardUsuario";
import CatalogoLivros from "@/pages/subpages/CatalogoLivros";
import MeusEmprestimos from "@/pages/subpages/MeusEmprestimos";
import MinhasReservas from "@/pages/subpages/MinhasReservas";
import { MinhasMultas } from "@/pages/subpages/MinhasMultas";
function UserDashboard() {
  return (
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
  );
}

export default UserDashboard;



