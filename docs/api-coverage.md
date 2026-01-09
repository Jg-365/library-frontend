# Matriz de Cobertura da API

## Fonte dos endpoints

A extração direta do Swagger/OpenAPI no ambiente não foi possível (erro 403 ao tentar acessar `.../v3/api-docs`).
Por isso, esta matriz foi montada combinando os endpoints centralizados em `src/config/constants.ts`
com os paths usados nos serviços e subpages atuais. Assim que a spec OpenAPI puder ser exportada,
esta matriz deve ser revisada para validação final.

## Matriz de cobertura (paths + métodos)

| Endpoint | Método | Service (`src/services/*`) | Uso em UI (exemplos) | Status |
| --- | --- | --- | --- | --- |
| `/auth/login` | POST | `authService.login` | Fluxo de login | ✅ Coberto |
| `/auth/logout` | POST | `authService.logout` | Logout do usuário | ✅ Coberto |
| `/auth/register` | POST | `authService.register` | Cadastro de usuário | ✅ Coberto |
| `/auth/refresh` | POST | `authService.refresh` | Token refresh (não utilizado) | ⚠️ Sem consumo em UI |
| `/books` | GET | `livrosService.listarTodos` | Catálogo/Dashboard | ✅ Coberto |
| `/books` | GET (query) | `livrosService.filtrar` | Catálogo com filtros | ✅ Coberto |
| `/books` | POST | `livrosService.criar` | Cadastro de livros | ✅ Coberto |
| `/books/{isbn}` | GET | `livrosService.buscarPorIsbn` | Detalhe do livro | ✅ Coberto |
| `/books/{isbn}` | PATCH | `livrosService.atualizar` | Edição de livros | ✅ Coberto |
| `/books/{isbn}` | DELETE | `livrosService.deletar` | Exclusão de livros | ✅ Coberto |
| `/books/{isbn}/co-authors` | DELETE | `livrosService.removerCoautores` | Gestão de coautores | ⚠️ Sem consumo em UI |
| `/authors` | GET | `autoresService.buscarPorNome` | Busca de autores | ✅ Coberto |
| `/authors/all` | GET | `autoresService.listarTodos` | Seleção de autores | ✅ Coberto |
| `/authors/{email}` | GET | `autoresService.buscarPorEmail` | Detalhe de autor | ✅ Coberto |
| `/authors` | POST | `autoresService.criar` | Cadastro de autores | ✅ Coberto |
| `/authors/{email}` | PATCH | `autoresService.atualizar` | Edição de autores | ✅ Coberto |
| `/authors/{email}` | DELETE | `autoresService.deletar` | Remoção de autores | ✅ Coberto |
| `/categories` | GET | `categoriasService.listarTodas` | Listagens gerais | ✅ Coberto |
| `/categories?description=...` | GET | `categoriasService.buscarPorDescricao` | Filtro de categorias | ✅ Coberto |
| `/categories/{id}` | GET | `categoriasService.buscarPorId` | Detalhe de categoria | ✅ Coberto |
| `/categories` | POST | `categoriasService.criar` | Cadastro de categorias | ✅ Coberto |
| `/categories/{id}` | PATCH | `categoriasService.atualizar` | Edição de categorias | ✅ Coberto |
| `/categories/{id}` | DELETE | `categoriasService.deletar` | Exclusão de categorias | ✅ Coberto |
| `/subcategories` | POST | `subcategoriasService.criar` | Cadastro de subcategorias | ✅ Coberto |
| `/subcategories/{id}` | GET | `subcategoriasService.buscarPorId` | Detalhe de subcategoria | ✅ Coberto |
| `/subcategories/{id}` | PATCH | `subcategoriasService.atualizar` | Edição de subcategorias | ✅ Coberto |
| `/subcategories/{id}` | DELETE | `subcategoriasService.deletar` | Exclusão de subcategorias | ✅ Coberto |
| `/subcategories/search/{name}` | GET | `subcategoriasService.buscarPorNome` | Busca por nome | ✅ Coberto |
| `/subcategories?categoryCode=...` | GET | `subcategoriasService.listarPorCategoria` | Filtro por categoria | ✅ Coberto |
| `/users/me` | GET | `authService.login` | Perfil do usuário | ✅ Coberto |
| `/users/all` | GET | `usuariosService.listarTodos` | Listagem de usuários | ✅ Coberto |
| `/users/create` | POST | `usuariosService.criar` | Cadastro de usuários | ✅ Coberto |
| `/users/{enrollment}` | GET | `usuariosService.buscarPorEnrollment` | Busca de usuário | ✅ Coberto |
| `/users/{enrollment}` | DELETE | `usuariosService.deletar` | Exclusão de usuário | ✅ Coberto |
| `/users/teacher/{enrollment}` | PATCH | `usuariosService.atualizarProfessor` | Edição de professor | ✅ Coberto |
| `/users/student/{enrollment}` | PATCH | `usuariosService.atualizarAluno` | Edição de aluno | ✅ Coberto |
| `/users/employee/{enrollment}` | PATCH | `usuariosService.atualizarFuncionario` | Edição de funcionário | ✅ Coberto |
| `/users/teachers/by-course` | GET | `usuariosService.listarProfessoresPorCurso` | Professores por curso | ✅ Coberto |
| `/courses` | GET | `cursosService.listarTodos` | Listagem de cursos | ✅ Coberto |
| `/courses` | POST | `cursosService.criar` | Cadastro de cursos | ✅ Coberto |
| `/courses` | PATCH | `cursosService.atualizar` | Edição de cursos | ✅ Coberto |
| `/courses/{id}` | GET | `cursosService.buscarPorId` | Detalhe de curso | ✅ Coberto |
| `/courses/name/{courseName}` | GET | `cursosService.buscarPorNome` | Busca de curso | ✅ Coberto |
| `/courses/{id}` | DELETE | `cursosService.deletar` | Exclusão de cursos | ✅ Coberto |
| `/phones` | POST | `telefonesService.criar` | Cadastro de telefones | ⚠️ Sem consumo em UI |
| `/phones/{id}` | PATCH | `telefonesService.atualizar` | Edição de telefones | ⚠️ Sem consumo em UI |
| `/phones/{id}` | DELETE | `telefonesService.deletar` | Exclusão de telefones | ⚠️ Sem consumo em UI |
| `/loans` | GET | `emprestimosService.listarTodos` | Devoluções | ✅ Coberto |
| `/loans/{id}` | GET | `emprestimosService.buscarPorId` | Detalhe de empréstimo | ✅ Coberto |
| `/loans/users` | GET | `emprestimosService.listarPorUsuario` | Empréstimos do usuário | ✅ Coberto |
| `/loans/user` | POST | `emprestimosService.criar` | Empréstimo próprio | ✅ Coberto |
| `/loans/admin/{userId}` | POST | `emprestimosService.criarParaUsuario` | Empréstimo admin | ✅ Coberto |
| `/loans/return` | PATCH | `emprestimosService.devolver` | Devoluções | ✅ Coberto |
| `/copies` | POST | `copiasService.criar` | Cadastro de cópias | ⚠️ Sem consumo em UI |
| `/copies/{sequential}/{isbn}` | GET | `copiasService.buscarPorId` | Detalhe de cópia | ⚠️ Sem consumo em UI |
| `/copies/{sequential}` | PATCH | `copiasService.atualizar` | Edição de cópias | ⚠️ Sem consumo em UI |
| `/copies/{sequential}/{isbn}` | DELETE | `copiasService.deletar` | Exclusão de cópias | ⚠️ Sem consumo em UI |
| `/copies/status/{isbn}` | GET | `copiasService.buscarPorStatus` | Status de cópias | ⚠️ Sem consumo em UI |
| `/copies/all/{isbn}` | GET | `copiasService.listarPorIsbn` | Cópias por ISBN | ⚠️ Sem consumo em UI |
| `/reserves` | POST | `reservasService.criar` | Reservas | ✅ Coberto |
| `/reserves/{id}` | GET | `reservasService.buscarPorId` | Detalhe de reserva | ✅ Coberto |
| `/reserves/users` | GET | `reservasService.listarPorUsuario` | Minhas reservas | ✅ Coberto |
| `/reserves/books/{isbn}` | GET | `reservasService.listarPorLivro` | Reservas por livro | ✅ Coberto |
| `/reserves/{id}` | DELETE | `reservasService.deletar`/`cancelar` | Cancelamento de reservas | ✅ Coberto |
| `/fines/{id}` | GET | `multasService.buscarPorId` | Multas por ID | ⚠️ Sem consumo em UI |
| `/fines/pay/{id}` | PATCH | `multasService.pagar` | Pagamento de multas | ⚠️ Sem consumo em UI |
| `/fines/user/pending` | GET | `multasService.obterPendentes` | Multas pendentes | ⚠️ Sem consumo em UI |
| `/fines/user/pending/{userId}` | GET | `multasService.obterPendentesPorUsuario` | Multas pendentes | ⚠️ Sem consumo em UI |
| `/fines/user/paid` | GET | `multasService.obterPagas` | Multas pagas | ⚠️ Sem consumo em UI |
| `/fines/user/paid/{userId}` | GET | `multasService.obterPagasPorUsuario` | Multas pagas | ⚠️ Sem consumo em UI |

## Pontos de atenção

- Endpoints sem consumo em UI foram marcados como ⚠️; eles já possuem service mas não estão expostos em subpages.
- Cancelamentos de reserva foram padronizados para `DELETE /reserves/{id}` (antes havia chamadas `PUT`).
- O endpoint `/users` (base) existe nas constantes, porém não está em uso direto — toda a UI utiliza `/users/all`.

