/**
 * Tipos que representam as respostas do backend Java
 * Estes tipos refletem exatamente como o backend retorna os dados
 */

export interface BookResponse {
  isbn: string;
  title: string;
  releaseYear: number;
  publisher: string;
  availableCopies: number; // Backend retorna availableCopies, não numberOfCopies
  numberOfCopies?: number;
  category?: string; // Backend retorna category (nome), não subCategoryId
  categoryId?: number;
  subCategory?: string;
  subCategoryId?: number;
  author?: string; // Backend retorna author (nome completo), não emailAuthor
  emailAuthor?: string;
  coAuthorsEmails?: string[];
  description?: string;
  imageUrl?: string;
}

export interface ReserveResponse {
  id: number;
  userEnrollment: number;
  bookIsbn: string;
  reserveDate: string; // ISO DateTime
}

export interface CategoryResponse {
  categoryCode: number;
  description: string;
}

export interface SubCategoryResponse {
  id: number;
  description: string;
  category: CategoryResponse;
}

export interface CopyResponse {
  sequential: number;
  status: string;
  isbn: string;
}

export interface FineResponse {
  id: number;
  value: number;
  daysOverdue: number;
  paymentDate: string | null; // ISO Date
  loanId: number;
  bookTitles: string[];
}

export interface PendingFineResponse {
  id: number;
  value: number;
  daysOverdue: number;
  loanId: number;
  bookTitles: string[];
}

/**
 * Loan (Empréstimo) Responses
 */
export interface LoanResponse {
  loanCode: number;
  loanDate: string; // ISO Date
  expectedReturnDate: string; // ISO Date
  returnDate: string | null; // ISO Date (null if not returned)
  userId: number;
  copyCodes: string[]; // IDs das cópias físicas emprestadas
}

export interface LoanReturnResponse {
  successIsbn: string[];
  failedIsbn: string[];
}

/**
 * Loan Request (para criar empréstimo)
 */
export interface LoanRequest {
  userId?: number; // Opcional se autenticado
  isbnCodes: string[]; // Lista de ISBNs para emprestar
}
