"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { autorSchema } from "@/schemas";

export const autorColumn: ColumnDef<typeof autorSchema>[] =
  [
    {
      accessorKey: "id",
      header: "ID",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "name",
      header: "Name",
    },
  ];



