/**
 * Serviço de Relatórios - Agregação de dados reais
 */

import api from "./api";
import { API_ENDPOINTS } from "@/config/constants";

export type ReportType =
  | "emprestimos"
  | "usuarios"
  | "acervo"
  | "reservas"
  | "performance";

export type ReportFormat = "pdf" | "csv";

export interface ReportSummary {
  totalEmprestimos: number;
  totalLivros: number;
  totalUsuarios: number;
  usuariosAtivos: number;
}

export interface ReportDataset {
  tipo: ReportType;
  title: string;
  headers: string[];
  rows: Array<Array<string | number>>;
  generatedAt: string;
}

const isPrivileged = (perfil?: string) =>
  perfil === "ADMIN" || perfil === "BIBLIOTECARIO";

const normalizeArray = <T>(data: any): T[] => {
  if (Array.isArray(data)) {
    return data;
  }
  return data?.content ?? [];
};

const normalizeDate = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toISOString().split("T")[0];
};

const formatTextValue = (value: unknown) => {
  if (value === null || value === undefined) return "";
  return String(value);
};

const parseAuthors = (authors: any) => {
  if (!authors) return "";
  if (Array.isArray(authors)) {
    return authors
      .map((author) =>
        typeof author === "string"
          ? author
          : author?.name || author?.nome
      )
      .filter(Boolean)
      .join(", ");
  }
  return formatTextValue(authors);
};

const buildCsv = (dataset: ReportDataset) => {
  const escape = (value: string | number) =>
    `"${String(value).replace(/"/g, '""')}"`;
  const lines = [
    dataset.headers.map(escape).join(","),
    ...dataset.rows.map((row) =>
      row.map(escape).join(",")
    ),
  ];
  return lines.join("\n");
};

const sanitizePdfText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, "");

const buildPdf = (lines: string[]) => {
  const sanitized = lines.map((line) =>
    sanitizePdfText(line)
  );

  const escapePdf = (value: string) =>
    value.replace(/[()\\]/g, "\\$&");

  const textLines: string[] = [
    "BT",
    "/F1 12 Tf",
    "72 760 Td",
  ];

  sanitized.forEach((line, index) => {
    if (index > 0) {
      textLines.push("0 -16 Td");
    }
    textLines.push(`(${escapePdf(line)}) Tj`);
  });

  textLines.push("ET");

  const stream = textLines.join("\n");
  const encoder = new TextEncoder();
  const streamLength = encoder.encode(stream).length;

  const objects = [
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
    "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n",
    `4 0 obj\n<< /Length ${streamLength} >>\nstream\n${stream}\nendstream\nendobj\n`,
    "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
  ];

  const header = "%PDF-1.4\n";
  let pdfParts: string[] = [header];
  const offsets: number[] = [0];
  let byteOffset = encoder.encode(header).length;

  objects.forEach((object) => {
    offsets.push(byteOffset);
    pdfParts.push(object);
    byteOffset += encoder.encode(object).length;
  });

  const xrefStart = byteOffset;
  const xrefLines = [
    "xref\n0 6\n",
    "0000000000 65535 f \n",
    ...offsets.slice(1).map((offset) =>
      `${String(offset).padStart(10, "0")} 00000 n \n`
    ),
    "trailer\n<< /Size 6 /Root 1 0 R >>\n",
    `startxref\n${xrefStart}\n%%EOF`,
  ];

  pdfParts = pdfParts.concat(xrefLines);

  return new Blob([pdfParts.join("")], {
    type: "application/pdf",
  });
};

const downloadBlob = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

const buildFileName = (tipo: ReportType, format: ReportFormat) => {
  const date = new Date().toISOString().split("T")[0];
  return `relatorio-${tipo}-${date}.${format}`;
};

const buildPerformanceRows = (data: {
  loans: any[];
  users: any[];
  books: any[];
  reserves: any[];
}) => {
  const now = new Date();
  let overdue = 0;
  let activeLoans = 0;
  data.loans.forEach((loan) => {
    if (loan?.returnDate) return;
    activeLoans += 1;
    const expected = loan?.expectedReturnDate
      ? new Date(loan.expectedReturnDate)
      : null;
    if (expected && expected.getTime() < now.getTime()) {
      overdue += 1;
    }
  });

  const reservesActive = data.reserves.filter(
    (reserve) =>
      ["ATIVA", "ATIVO", "PENDENTE"].includes(
        String(reserve?.status || "").toUpperCase()
      )
  ).length;

  return [
    ["Total de empréstimos", data.loans.length],
    ["Empréstimos ativos", activeLoans],
    ["Empréstimos atrasados", overdue],
    ["Total de reservas", data.reserves.length],
    ["Reservas ativas", reservesActive],
    ["Usuários cadastrados", data.users.length],
    ["Livros cadastrados", data.books.length],
  ];
};

export const reportsService = {
  async getSummary(perfil?: string): Promise<ReportSummary> {
    const summary: ReportSummary = {
      totalEmprestimos: 0,
      totalLivros: 0,
      totalUsuarios: 0,
      usuariosAtivos: 0,
    };

    const [loansResult, booksResult, usersResult] =
      await Promise.allSettled([
        api.get(API_ENDPOINTS.EMPRESTIMOS.BY_USER),
        api.get(API_ENDPOINTS.LIVROS.BASE),
        isPrivileged(perfil)
          ? api.get(API_ENDPOINTS.USUARIOS.ALL)
          : api.get(API_ENDPOINTS.USUARIOS.ME),
      ]);

    if (loansResult.status === "fulfilled") {
      const loans = normalizeArray<any>(
        loansResult.value.data
      );
      summary.totalEmprestimos = loans.length;
    }

    if (booksResult.status === "fulfilled") {
      const data = booksResult.value.data;
      summary.totalLivros =
        data?.totalElements ??
        normalizeArray<any>(data).length;
    }

    if (usersResult.status === "fulfilled") {
      if (isPrivileged(perfil)) {
        const users = normalizeArray<any>(
          usersResult.value.data
        );
        summary.totalUsuarios = users.length;
        summary.usuariosAtivos = users.filter(
          (user) => user?.active !== false
        ).length;
      } else {
        summary.totalUsuarios = usersResult.value.data
          ? 1
          : 0;
        summary.usuariosAtivos = summary.totalUsuarios;
      }
    }

    return summary;
  },

  async getReportDataset(
    tipo: ReportType,
    perfil?: string
  ): Promise<ReportDataset> {
    const generatedAt = new Date().toISOString();

    const fetchLoans = async () => {
      const resp = await api.get(
        API_ENDPOINTS.EMPRESTIMOS.BY_USER
      );
      return normalizeArray<any>(resp.data);
    };

    const fetchUsers = async () => {
      const resp = await api.get(
        isPrivileged(perfil)
          ? API_ENDPOINTS.USUARIOS.ALL
          : API_ENDPOINTS.USUARIOS.ME
      );
      if (isPrivileged(perfil)) {
        return normalizeArray<any>(resp.data);
      }
      return resp.data ? [resp.data] : [];
    };

    const fetchBooks = async () => {
      const resp = await api.get(API_ENDPOINTS.LIVROS.BASE);
      const data = resp.data;
      return normalizeArray<any>(data);
    };

    const fetchReserves = async () => {
      const resp = await api.get(
        API_ENDPOINTS.RESERVAS.BY_USER
      );
      return normalizeArray<any>(resp.data);
    };

    switch (tipo) {
      case "emprestimos": {
        const loans = await fetchLoans();
        return {
          tipo,
          title: "Relatório de Empréstimos",
          headers: [
            "Código",
            "Usuário",
            "Data empréstimo",
            "Devolução prevista",
            "Devolução realizada",
          ],
          rows: loans.map((loan) => [
            formatTextValue(loan?.loanCode ?? loan?.id),
            formatTextValue(loan?.userId),
            normalizeDate(loan?.loanDate),
            normalizeDate(loan?.expectedReturnDate),
            normalizeDate(loan?.returnDate),
          ]),
          generatedAt,
        };
      }
      case "usuarios": {
        const users = await fetchUsers();
        return {
          tipo,
          title: "Relatório de Usuários",
          headers: [
            "Matrícula",
            "Nome",
            "Perfil",
            "Ativo",
          ],
          rows: users.map((user) => [
            formatTextValue(user?.enrollment ?? user?.id),
            formatTextValue(
              user?.name || user?.nome || user?.username
            ),
            formatTextValue(user?.role ?? user?.userType),
            user?.active === false ? "Não" : "Sim",
          ]),
          generatedAt,
        };
      }
      case "acervo": {
        const books = await fetchBooks();
        return {
          tipo,
          title: "Relatório de Acervo",
          headers: [
            "ISBN",
            "Título",
            "Autores",
            "Exemplares",
          ],
          rows: books.map((book) => [
            formatTextValue(book?.isbn ?? book?.id),
            formatTextValue(
              book?.title || book?.titulo || book?.name
            ),
            parseAuthors(book?.authors || book?.autores),
            formatTextValue(
              book?.copies ?? book?.availableCopies ?? 0
            ),
          ]),
          generatedAt,
        };
      }
      case "reservas": {
        const reserves = await fetchReserves();
        return {
          tipo,
          title: "Relatório de Reservas",
          headers: [
            "Código",
            "Usuário",
            "ISBN",
            "Data",
            "Status",
          ],
          rows: reserves.map((reserve) => [
            formatTextValue(reserve?.id ?? reserve?.code),
            formatTextValue(reserve?.userEnrollment),
            formatTextValue(reserve?.bookIsbn),
            normalizeDate(reserve?.reserveDate),
            formatTextValue(reserve?.status),
          ]),
          generatedAt,
        };
      }
      case "performance": {
        const [loans, users, books, reserves] =
          await Promise.all([
            fetchLoans(),
            fetchUsers(),
            fetchBooks(),
            fetchReserves(),
          ]);
        return {
          tipo,
          title: "Relatório de Performance",
          headers: ["Indicador", "Valor"],
          rows: buildPerformanceRows({
            loans,
            users,
            books,
            reserves,
          }),
          generatedAt,
        };
      }
      default: {
        return {
          tipo,
          title: "Relatório",
          headers: [],
          rows: [],
          generatedAt,
        };
      }
    }
  },

  downloadReport(dataset: ReportDataset, format: ReportFormat) {
    const filename = buildFileName(dataset.tipo, format);
    if (format === "csv") {
      const csv = buildCsv(dataset);
      downloadBlob(
        new Blob([csv], {
          type: "text/csv;charset=utf-8;",
        }),
        filename
      );
      return;
    }

    const lines = [
      dataset.title,
      `Gerado em: ${normalizeDate(dataset.generatedAt)}`,
      "",
      dataset.headers.join(" | "),
      ...dataset.rows.map((row) =>
        row.map(formatTextValue).join(" | ")
      ),
    ];

    downloadBlob(buildPdf(lines), filename);
  },
};

