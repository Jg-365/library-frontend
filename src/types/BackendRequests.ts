export interface BookRequest {
  isbn: string;
  title: string;
  releaseYear: number;
  publisher: string;
  subCategoryId?: number;
  subcategoriaId?: number;
  emailAuthor: string;
  coAuthorsEmails: string[];
}

export interface BookRequestUpdate {
  title: string;
  releaseYear: number;
  publisher: string;
  subCategoryId: number;
  emailAuthor: string;
  coAuthorsEmails: string[];
}

