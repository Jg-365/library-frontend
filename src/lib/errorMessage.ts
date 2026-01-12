export const getErrorMessage = (
  value: unknown,
  fallback = "Erro inesperado"
): string => {
  if (typeof value === "string") {
    return value;
  }

  if (value instanceof Error) {
    return value.message || fallback;
  }

  if (value && typeof value === "object") {
    const maybeMessage = (value as { message?: unknown })
      .message;

    if (typeof maybeMessage === "string") {
      return maybeMessage;
    }

    try {
      return JSON.stringify(value);
    } catch (error) {
      console.error("Erro ao serializar mensagem:", error);
      return fallback;
    }
  }

  return fallback;
};

